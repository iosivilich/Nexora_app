import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabaseAdmin, supabasePublic } from '../../../src/lib/supabase';

const SEARCH_CONSULTANTS_TOOL: Groq.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'buscar_consultores',
    description:
      'Busca consultores en la base de datos de Nexora según los criterios del usuario empresa.',
    parameters: {
      type: 'object',
      properties: {
        keywords: {
          type: 'string',
          description:
            'Palabras clave para buscar en nombre, rol, bio o expertise. Ej: "data science", "contabilidad", "cloud"',
        },
        ciudad: {
          type: 'string',
          description: 'Ciudad donde buscar. Ej: "Bogotá", "Medellín"',
        },
        rating_minimo: {
          type: 'number',
          description: 'Rating mínimo requerido (0-5)',
        },
        experiencia_minima: {
          type: 'number',
          description: 'Años mínimos de experiencia',
        },
        solo_verificados: {
          type: 'boolean',
          description: 'Si true, solo retorna consultores verificados',
        },
      },
      required: ['keywords'],
    },
  },
};

const SEARCH_COMPANIES_TOOL: Groq.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'buscar_empresas',
    description:
      'Busca empresas en la base de datos de Nexora donde un consultor podría ofrecer sus servicios.',
    parameters: {
      type: 'object',
      properties: {
        keywords: {
          type: 'string',
          description:
            'Palabras clave para buscar en sector, nombre o descripción. Ej: "contabilidad", "fintech", "manufactura"',
        },
        ciudad: {
          type: 'string',
          description: 'Ciudad donde buscar empresas',
        },
      },
      required: ['keywords'],
    },
  },
};

function getDb() {
  return supabaseAdmin ?? supabasePublic;
}

async function fetchConsultants(params: {
  keywords: string;
  ciudad?: string;
  ratingMinimo?: number;
  experienciaMinima?: number;
  soloVerificados?: boolean;
}) {
  let query = getDb()
    .from('consultants')
    .select(
      'id, role, rating, projects, experience_years, bio, expertise, verified, profiles!consultants_id_fkey(full_name, city)',
    )
    .limit(10);

  if (typeof params.ratingMinimo === 'number') {
    query = query.gte('rating', params.ratingMinimo);
  }
  if (typeof params.experienciaMinima === 'number') {
    query = query.gte('experience_years', params.experienciaMinima);
  }
  if (params.soloVerificados) {
    query = query.eq('verified', true);
  }

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []) as Array<{
    id: string;
    role: string | null;
    rating: number | null;
    projects: number | null;
    experience_years: number | null;
    bio: string | null;
    expertise: string[] | null;
    verified: boolean | null;
    profiles: { full_name: string | null; city: string | null } | Array<{ full_name: string | null; city: string | null }> | null;
  }>;

  if (params.keywords) {
    const terms = params.keywords.toLowerCase().split(/\s+/).filter(Boolean);
    rows = rows.filter((c) => {
      const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
      const haystack = [c.role, c.bio, ...(c.expertise ?? []), profile?.full_name, profile?.city]
        .join(' ')
        .toLowerCase();
      return terms.some((t) => haystack.includes(t));
    });
  }

  if (params.ciudad) {
    const needle = params.ciudad.toLowerCase();
    rows = rows.filter((c) => {
      const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
      return profile?.city?.toLowerCase().includes(needle);
    });
  }

  return rows.slice(0, 5).map((c) => {
    const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    return {
      nombre: profile?.full_name ?? 'Sin nombre',
      rol: c.role ?? 'Consultor',
      ciudad: profile?.city ?? 'No especificada',
      rating: c.rating ?? 0,
      experiencia: c.experience_years ?? 0,
      proyectos: c.projects ?? 0,
      expertise: (c.expertise ?? []).slice(0, 4),
      verificado: c.verified ?? false,
      bio: c.bio ? c.bio.slice(0, 120) + '…' : null,
    };
  });
}

async function fetchCompanies(params: { keywords: string; ciudad?: string }) {
  const { data, error } = await getDb()
    .from('empresa')
    .select('id_empresa, nombre_empresa, sector, tamaño_empresa, descripcion, estado')
    .limit(20);

  if (error) {
    // Fallback to profiles if empresa table unavailable
    const { data: fallback } = await getDb()
      .from('profiles')
      .select('full_name, city')
      .eq('user_type', 'EMPRESA')
      .limit(10);
    return (fallback ?? []).map((p: { full_name: string | null; city: string | null }) => ({
      nombre: p.full_name ?? 'Sin nombre',
      sector: 'No especificado',
      ciudad: p.city ?? 'No especificada',
      tamaño: null,
      descripcion: null,
    }));
  }

  let rows = (data ?? []) as Array<{
    id_empresa: number;
    nombre_empresa: string | null;
    sector: string | null;
    'tamaño_empresa': string | null;
    descripcion: string | null;
    estado: string | null;
  }>;

  if (params.keywords) {
    const terms = params.keywords.toLowerCase().split(/\s+/).filter(Boolean);
    rows = rows.filter((e) => {
      const haystack = [e.nombre_empresa, e.sector, e.descripcion].join(' ').toLowerCase();
      return terms.some((t) => haystack.includes(t));
    });
  }

  if (params.ciudad) {
    // empresa table has no city — skip city filter (profile-linked city not available here)
  }

  return rows.slice(0, 5).map((e) => ({
    nombre: e.nombre_empresa ?? 'Sin nombre',
    sector: e.sector ?? 'No especificado',
    tamaño: e['tamaño_empresa'] ?? null,
    descripcion: e.descripcion ? e.descripcion.slice(0, 120) + '…' : null,
  }));
}

type ChatMessage =
  | { role: 'user' | 'assistant' | 'system'; content: string }
  | Groq.Chat.Completions.ChatCompletionAssistantMessageParam
  | Groq.Chat.Completions.ChatCompletionToolMessageParam;

export async function POST(request: Request) {
  try {
    const { messages, userType } = (await request.json()) as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      userType: 'EMPRESA' | 'CONSULTOR';
    };

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY no configurado.' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const isEmpresa = userType === 'EMPRESA';

    const systemPrompt = isEmpresa
      ? `Eres Nexa AI, el asistente inteligente de Nexora — plataforma B2B que conecta empresas con consultores.
Ayudas a empresas a encontrar el consultor ideal. Cuando el usuario exprese una necesidad, usa buscar_consultores.
Responde en español, de forma breve y amigable. Presenta los resultados destacando nombre, rol y expertise.
Si no hay resultados suficientes, sugiere ampliar los criterios.`
      : `Eres Nexa AI, el asistente inteligente de Nexora — plataforma B2B que conecta consultores con empresas.
Ayudas a consultores a encontrar empresas donde ofrecer sus servicios. Cuando el consultor describa qué busca, usa buscar_empresas.
Responde en español, de forma breve y amigable. Presenta los resultados destacando nombre, sector y tamaño.
Si no hay resultados suficientes, sugiere ampliar los criterios.`;

    const tools = isEmpresa ? [SEARCH_CONSULTANTS_TOOL] : [SEARCH_COMPANIES_TOOL];

    const conversationMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // First call — let Groq decide if it needs to call a tool
    const first = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: conversationMessages as Groq.Chat.Completions.ChatCompletionMessageParam[],
      tools,
      tool_choice: 'auto',
      max_tokens: 512,
      temperature: 0.2,
    });

    const firstMsg = first.choices[0].message;

    // No tool call — return direct response (greeting, clarification, etc.)
    if (!firstMsg.tool_calls || firstMsg.tool_calls.length === 0) {
      return NextResponse.json({ message: firstMsg.content ?? 'Hola, ¿en qué puedo ayudarte?', results: [] });
    }

    // Execute the tool
    const toolCall = firstMsg.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;

    let results: unknown[] = [];

    if (toolCall.function.name === 'buscar_consultores') {
      results = await fetchConsultants({
        keywords: String(args.keywords ?? ''),
        ciudad: args.ciudad ? String(args.ciudad) : undefined,
        ratingMinimo: typeof args.rating_minimo === 'number' ? args.rating_minimo : undefined,
        experienciaMinima: typeof args.experiencia_minima === 'number' ? args.experiencia_minima : undefined,
        soloVerificados: args.solo_verificados === true,
      });
    } else if (toolCall.function.name === 'buscar_empresas') {
      results = await fetchCompanies({
        keywords: String(args.keywords ?? ''),
        ciudad: args.ciudad ? String(args.ciudad) : undefined,
      });
    }

    // Second call — Groq formats the results into natural language
    const second = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        ...conversationMessages,
        firstMsg as Groq.Chat.Completions.ChatCompletionMessageParam,
        {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(results),
        },
      ] as Groq.Chat.Completions.ChatCompletionMessageParam[],
      max_tokens: 768,
      temperature: 0.4,
    });

    return NextResponse.json({
      message: second.choices[0].message.content ?? 'No encontré resultados para tu búsqueda.',
      results,
    });
  } catch (error) {
    console.error('POST /api/nexa failed', error);
    return NextResponse.json({ error: 'Error procesando tu solicitud. Intenta de nuevo.' }, { status: 500 });
  }
}
