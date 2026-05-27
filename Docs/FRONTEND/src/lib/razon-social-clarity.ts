import Groq from 'groq-sdk';

export type ClarityInput = {
  razonSocial: string;
  sector?: string | null;
  tipoOrganizacion?: string | null;
};

export type ClarityResult = {
  clarity: number;
  explanation: string;
};

const SYSTEM_PROMPT = `Eres un analista que evalúa qué tan clara es la razón social de una empresa colombiana.
Una razón social es CLARA cuando un lector puede inferir la actividad económica solo con el nombre
(p. ej. "Soluciones Informáticas del Caribe SAS" → claro; "ABC SAS", "Inversiones García", "AAAA" → poco claro).
Penalizar: siglas opacas, nombres genéricos, solo apellidos+inversiones, ruido tipográfico.
Premiar: palabras del sector, actividad descrita, claridad fonética.
Responde SOLO con JSON: {"clarity": number entre 0 y 1, "explanation": "razón breve"}.`;

export async function scoreRazonSocialClarity(input: ClarityInput): Promise<ClarityResult | null> {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }
  if (!input.razonSocial || input.razonSocial.trim().length < 2) {
    return { clarity: 0, explanation: 'Razón social vacía o demasiado corta.' };
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const userPrompt = `Razón social: "${input.razonSocial}"
Sector declarado: ${input.sector ?? 'desconocido'}
Tipo de organización: ${input.tipoOrganizacion ?? 'desconocido'}`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 120,
      temperature: 0.1,
    });
    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw) as Partial<ClarityResult>;
    const clarity = typeof parsed.clarity === 'number' ? Math.min(Math.max(parsed.clarity, 0), 1) : 0.5;
    const explanation = typeof parsed.explanation === 'string' ? parsed.explanation : '';
    return { clarity, explanation };
  } catch (error) {
    console.warn('Groq clarity scoring failed', error);
    return null;
  }
}
