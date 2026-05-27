import { NextResponse } from 'next/server';
import { getAuthenticatedContext } from '../../../src/lib/backend-data';
import { supabaseAdmin, supabasePublic } from '../../../src/lib/supabase';
import { embedText, pgVectorLiteral } from '../../../src/lib/embeddings';
import {
  rankConsultants,
  rankEmpresas,
  type ConsultantCandidate,
  type EmpresaCandidate,
} from '../../../src/lib/recommender';

function getDb() {
  return supabaseAdmin ?? supabasePublic;
}

function getErrorStatus(error: unknown) {
  return typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
    ? error.status
    : 500;
}

type ConsultorMatch = {
  id_consultor: number;
  nombre: string | null;
  apellido: string | null;
  rol: string | null;
  especialidad: string | null;
  bio: string | null;
  expertise: string[] | null;
  ciudad: string | null;
  departamento: string | null;
  avatar_url: string | null;
  rating: number | null;
  verified: boolean | null;
  anos_experiencia: number | null;
  similarity: number;
};

type EmpresaMatch = {
  id_empresa: number;
  nombre_empresa: string | null;
  sector: string | null;
  descripcion: string | null;
  ciudad: string | null;
  departamento: string | null;
  es_pyme: boolean | null;
  website: string | null;
  nit: string | null;
  razon_social_clarity: number | null;
  similarity: number;
};

const POOL_SIZE = 40;

export async function GET(request: Request) {
  try {
    const context = await getAuthenticatedContext();
    const url = new URL(request.url);
    const k = Number(url.searchParams.get('k') ?? '10') || 10;
    const userType = context.profile.user_type;

    if (userType === 'EMPRESA') {
      const empresa = context.companyRecord;
      const queryText = [empresa?.sector, empresa?.descripcion, empresa?.nombre_empresa]
        .filter(Boolean)
        .join(' ') || 'consultoria empresarial';
      const queryEmbedding = await embedText(queryText, 'query');
      if (!queryEmbedding) {
        return NextResponse.json({
          userType,
          query: { text: queryText, city: empresa?.ciudad ?? '' },
          items: [],
          note: 'Embeddings no disponibles: configura HUGGINGFACE_API_TOKEN.',
        });
      }

      const { data, error } = await getDb().rpc('match_consultores', {
        query_embedding: pgVectorLiteral(queryEmbedding),
        match_count: POOL_SIZE,
      });
      if (error) throw error;

      const candidates: ConsultantCandidate[] = ((data ?? []) as ConsultorMatch[]).map((row) => ({
        id: row.id_consultor,
        name: [row.nombre, row.apellido].filter(Boolean).join(' ').trim() || 'Consultor',
        role: row.rol ?? row.especialidad ?? 'Consultor',
        text: [row.rol, row.especialidad, row.bio, ...(row.expertise ?? [])].filter(Boolean).join(' '),
        city: row.ciudad ?? '',
        departamento: row.departamento,
        rating: row.rating,
        verified: row.verified,
        experience: row.anos_experiencia,
        avatarUrl: row.avatar_url,
        bio: row.bio,
        expertise: row.expertise ?? [],
        textSimilarity: row.similarity,
      }));

      const items = rankConsultants(
        { city: empresa?.ciudad ?? context.profile.city ?? '', departamento: empresa?.departamento ?? null },
        candidates,
        k,
      );

      return NextResponse.json({
        userType,
        query: { text: queryText, city: empresa?.ciudad ?? '' },
        items,
      });
    }

    if (userType === 'CONSULTOR') {
      const consultor = context.consultantRecord;
      const auth = context.consultantProfile;
      const expertise = auth?.expertise ?? [];
      const queryText = [consultor?.especialidad, auth?.role, auth?.bio, ...expertise]
        .filter(Boolean)
        .join(' ') || 'consultoria';
      const queryEmbedding = await embedText(queryText, 'query');
      if (!queryEmbedding) {
        return NextResponse.json({
          userType,
          query: { text: queryText, city: consultor?.ciudad ?? '' },
          items: [],
          note: 'Embeddings no disponibles: configura HUGGINGFACE_API_TOKEN.',
        });
      }

      const { data, error } = await getDb().rpc('match_empresas', {
        query_embedding: pgVectorLiteral(queryEmbedding),
        match_count: POOL_SIZE,
      });
      if (error) throw error;

      const candidates: EmpresaCandidate[] = ((data ?? []) as EmpresaMatch[]).map((row) => {
        const razonSocial = row.nombre_empresa ?? '';
        return {
          id: row.id_empresa,
          nombreEmpresa: razonSocial,
          razonSocial,
          text: [razonSocial, row.sector, row.descripcion].filter(Boolean).join(' '),
          city: row.ciudad ?? '',
          departamento: row.departamento,
          sector: row.sector,
          esPyme: row.es_pyme,
          clarityScore: row.razon_social_clarity,
          website: row.website && row.website.trim() !== '' ? row.website : null,
          descripcion: row.descripcion,
          textSimilarity: row.similarity,
        };
      });

      const items = rankEmpresas(
        { city: consultor?.ciudad ?? context.profile.city ?? '' },
        candidates,
        k,
      );

      return NextResponse.json({
        userType,
        query: { text: queryText, city: consultor?.ciudad ?? '' },
        items,
      });
    }

    return NextResponse.json({ userType, items: [], query: null });
  } catch (error) {
    console.error('GET /api/recommendations failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos generar recomendaciones.' },
      { status: getErrorStatus(error) },
    );
  }
}
