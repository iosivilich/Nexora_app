// Fuente: GitHub Users API. 68K cuentas con `location:colombia`.
// Sin auth: 60 req/h. Con `GITHUB_PAT`: 5000 req/h.
// La búsqueda devuelve metadatos básicos; para `bio`, `name`, `public_repos`
// y `created_at` hay que hacer un fetch adicional a /users/{login}.

import {
  diceBearAvatar,
  inferExpertise,
  inferRol,
  syntheticAge,
  syntheticPhone,
  syntheticRate,
  syntheticRating,
} from './consultores-enrich';
import type { ConsultantCatalogItem } from './backend-types';

const GH_API = 'https://api.github.com';

const CIUDAD_REGEX: Array<[RegExp, string]> = [
  [/bogot[aá]/i,        'Bogotá'],
  [/medell[ií]n/i,      'Medellín'],
  [/\bcali\b/i,         'Cali'],
  [/barranquilla/i,     'Barranquilla'],
  [/cartagena/i,        'Cartagena'],
  [/bucaramanga/i,      'Bucaramanga'],
  [/iba(gué|gue)/i,     'Ibagué'],
  [/pereira/i,          'Pereira'],
  [/pasto/i,            'Pasto'],
  [/villavicencio/i,    'Villavicencio'],
  [/manizales/i,        'Manizales'],
  [/santa marta/i,      'Santa Marta'],
  [/c[uú]cuta/i,        'Cúcuta'],
  [/popay[aá]n/i,       'Popayán'],
];

export function parseCiudadFromLocation(location: string | null | undefined): string {
  if (!location) return '';
  for (const [re, display] of CIUDAD_REGEX) {
    if (re.test(location)) return display;
  }
  return '';
}

function splitNombre(full: string | null | undefined, fallback: string): {
  nombre: string;
  apellido: string;
} {
  const raw = (full ?? '').trim();
  if (!raw) return { nombre: fallback, apellido: '' };
  const parts = raw.split(/\s+/);
  if (parts.length <= 1) return { nombre: raw, apellido: '' };
  const cut = Math.max(1, parts.length - 2);
  return {
    nombre:   parts.slice(0, cut).join(' '),
    apellido: parts.slice(cut).join(' '),
  };
}

function yearsSince(iso: string | null | undefined): number {
  if (!iso) return 0;
  const created = new Date(iso);
  if (Number.isNaN(created.getTime())) return 0;
  const diffMs = Date.now() - created.getTime();
  return Math.min(25, Math.max(0, Math.floor(diffMs / (365.25 * 24 * 3600 * 1000))));
}

type GhSearchUser = {
  login:      string;
  id:         number;
  avatar_url: string;
  html_url:   string;
  type:       string;
};

type GhSearchResponse = {
  total_count: number;
  items:       GhSearchUser[];
};

type GhUserDetail = {
  login:        string;
  id:           number;
  name:         string | null;
  avatar_url:   string;
  bio:          string | null;
  location:     string | null;
  email:        string | null;
  hireable:     boolean | null;
  public_repos: number;
  followers:    number;
  blog:         string | null;
  twitter_username: string | null;
  created_at:   string;
  type:         string;
};

function ghHeaders(): Record<string, string> {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'nexora-app/1.0',
    ...(process.env.GITHUB_PAT ? { Authorization: `Bearer ${process.env.GITHUB_PAT}` } : {}),
  };
}

async function ghFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: ghHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

function mapDetail(detail: GhUserDetail): ConsultantCatalogItem | null {
  if (detail.type !== 'User') return null;
  if (!detail.bio?.trim() && !detail.name?.trim()) return null;

  const fullName    = detail.name?.trim() || detail.login;
  const { nombre, apellido } = splitNombre(detail.name, detail.login);
  const bio         = detail.bio?.trim() || `Profesional independiente en GitHub (@${detail.login}).`;
  const rol         = inferRol({ bio, fallback: 'Software Engineer' });
  const expertise   = inferExpertise({ bio });
  const ciudad      = parseCiudadFromLocation(detail.location);

  return {
    idExterno:         detail.login,
    fuente:            'github',
    nombre,
    apellido,
    email:             detail.email,
    telefono:          syntheticPhone(detail.login),
    rol,
    bio,
    especialidad:      rol,
    expertise,
    ciudad,
    departamento:      '',
    avatarUrl:         detail.avatar_url || diceBearAvatar(fullName),
    experienciaAnos:   yearsSince(detail.created_at),
    tarifaReferencial: syntheticRate(detail.login),
    rating:            syntheticRating(detail.login),
    edad:              syntheticAge(detail.login),
    estado:            detail.hireable ? 'disponible' : 'ocupado',
    verified:          false,
    fechaRegistro:     detail.created_at ?? null,
  };
}

export type GithubConsultorFilters = {
  ciudad?: string;
  q?:      string;
  limit?:  number;
  offset?: number;
};

// Construye el query string para /search/users. Solo cuentas tipo User en Colombia,
// con bio o nombre poblado, idealmente "hireable" cuando se filtra estricto.
function buildSearchQuery(ciudad?: string, extra?: string): string {
  const parts = ['location:colombia', 'type:user'];
  if (ciudad) parts.unshift(`location:"${ciudad}"`);
  if (extra)  parts.push(extra);
  return parts.join(' ');
}

export async function fetchGithubConsultores(
  filters: GithubConsultorFilters = {},
): Promise<ConsultantCatalogItem[]> {
  const { ciudad, q, limit = 30, offset = 0 } = filters;

  const perPage = Math.min(100, Math.max(1, limit));
  const page    = Math.floor(offset / perPage) + 1;
  const query   = buildSearchQuery(ciudad, q);

  const searchUrl = `${GH_API}/search/users?q=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}`;
  const search    = await ghFetch<GhSearchResponse>(searchUrl);

  const wanted  = search.items.filter((u) => u.type === 'User').slice(0, limit);

  // Fetch en serie para no saturar el rate limit (cache de Next absorbe re-pedidos).
  const detailed: ConsultantCatalogItem[] = [];
  for (const u of wanted) {
    try {
      const detail = await ghFetch<GhUserDetail>(`${GH_API}/users/${u.login}`);
      const mapped = mapDetail(detail);
      if (mapped) detailed.push(mapped);
    } catch (err) {
      console.warn(`github-consultores: skip @${u.login}`, (err as Error).message);
    }
  }

  return detailed;
}
