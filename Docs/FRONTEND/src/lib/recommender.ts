// Re-ranker para el sistema de recomendación.
//
// La similitud semántica `textSimilarity` ∈ [0, 1] viene precomputada por el
// motor vectorial (pgvector + embeddings multilingual-e5-small). Aquí solo
// combinamos esa señal con features categóricas:
//   - coincidencia de ciudad / departamento
//   - claridad de la razón social (Groq, precalculada)
//   - verificación y rating del consultor
//
// Mantener este re-ranker fuera de la DB nos permite experimentar con pesos
// sin tocar SQL y exponer `reasons[]` legibles en la UI.

import { citiesMatch, departmentMatch } from './text-utils';

export type ConsultantCandidate = {
  id: string | number;
  name: string;
  role: string;
  text: string;
  city: string;
  departamento?: string | null;
  rating?: number | null;
  verified?: boolean | null;
  experience?: number | null;
  avatarUrl?: string | null;
  bio?: string | null;
  expertise?: string[];
  textSimilarity: number;
};

export type EmpresaCandidate = {
  id: string | number;
  nombreEmpresa: string;
  razonSocial: string;
  text: string;
  city: string;
  departamento?: string | null;
  sector?: string | null;
  esPyme?: boolean | null;
  clarityScore?: number | null;
  website?: string | null;
  descripcion?: string | null;
  textSimilarity: number;
};

export type EmpresaQuery = {
  city: string;
  departamento?: string | null;
  esPymePreference?: boolean | null;
};

export type ConsultantQuery = {
  city: string;
  departamento?: string | null;
};

export type Recommendation<T> = {
  id: string | number;
  score: number;
  reasons: string[];
  item: T;
};

function cityComponent(query: { city: string; departamento?: string | null }, candidate: { city: string; departamento?: string | null }) {
  const cityScore = citiesMatch(query.city, candidate.city);
  const deptScore =
    cityScore === 0 ? departmentMatch(query.departamento ?? null, candidate.departamento ?? null) * 0.4 : 0;
  return { cityScore, deptScore, matchCiudad: Math.max(cityScore, deptScore) };
}

export function rankConsultants(
  query: EmpresaQuery,
  candidates: ConsultantCandidate[],
  k = 10,
): Recommendation<ConsultantCandidate>[] {
  const scored = candidates.map((candidate) => {
    const { cityScore, deptScore, matchCiudad } = cityComponent(query, candidate);
    const sim = clamp(candidate.textSimilarity);
    const verifiedScore = candidate.verified ? 1 : 0;
    const ratingScore = clamp((candidate.rating ?? 0) / 5);

    const score = 0.45 * sim + 0.35 * matchCiudad + 0.10 * verifiedScore + 0.10 * ratingScore;

    const reasons: string[] = [];
    if (sim > 0.6) reasons.push('Perfil semánticamente alineado');
    else if (sim > 0.4) reasons.push('Expertise relacionado');
    if (cityScore >= 0.8) reasons.push(`Misma ciudad (${candidate.city})`);
    else if (deptScore > 0) reasons.push('Mismo departamento');
    if (candidate.verified) reasons.push('Perfil verificado');
    if ((candidate.rating ?? 0) >= 4.5) reasons.push(`Rating ${candidate.rating?.toFixed(1)}`);

    return { id: candidate.id, score, reasons, item: candidate };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function rankEmpresas(
  query: ConsultantQuery,
  candidates: EmpresaCandidate[],
  k = 10,
): Recommendation<EmpresaCandidate>[] {
  const scored = candidates.map((candidate) => {
    const { cityScore, deptScore, matchCiudad } = cityComponent(query, candidate);
    const sim = clamp(candidate.textSimilarity);
    const clarity = typeof candidate.clarityScore === 'number' ? clamp(candidate.clarityScore) : 0.5;
    const websiteScore = candidate.website ? 1 : 0;

    const score = 0.40 * sim + 0.30 * matchCiudad + 0.20 * clarity + 0.10 * websiteScore;

    const reasons: string[] = [];
    if (sim > 0.6) reasons.push('Sector semánticamente alineado');
    else if (sim > 0.4) reasons.push('Sector relacionado');
    if (cityScore >= 0.8) reasons.push(`Misma ciudad (${candidate.city})`);
    else if (deptScore > 0) reasons.push('Mismo departamento');
    if (clarity >= 0.7) reasons.push('Razón social clara');
    else if (clarity > 0 && clarity < 0.3) reasons.push('Razón social poco descriptiva');
    if (candidate.website) reasons.push('Tiene sitio web');

    return { id: candidate.id, score, reasons, item: candidate };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

function clamp(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(Math.max(value, 0), 1);
}

// Compatibilidad con el código anterior basado en TF-IDF: exponemos aliases.
export const recommendConsultants = rankConsultants;
export const recommendEmpresas = rankEmpresas;
