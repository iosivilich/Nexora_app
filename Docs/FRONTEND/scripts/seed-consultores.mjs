#!/usr/bin/env node
// Bulk seed de consultores reales desde GitHub Users API + SECOP (datos.gov.co)
// hacia la tabla public.consultor. Upsert por (fuente, id_externo).
//
// Uso:
//   node scripts/seed-consultores.mjs                          # default: --limit 500 --source all
//   node scripts/seed-consultores.mjs --limit 2500
//   node scripts/seed-consultores.mjs --source github --limit 1000
//   node scripts/seed-consultores.mjs --source secop  --limit 500
//   node scripts/seed-consultores.mjs --dry-run --out muestra-consultores.json
//
// Requiere en .env.local:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY   (no NEXT_PUBLIC_*: el service role bypasea RLS)
//   SOCRATA_APP_TOKEN           (opcional, recomendado)
//   GITHUB_PAT                  (opcional, recomendado: 60→5000 req/h)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

// ─── 1. Cargar .env.local (sin dep externa) ────────────────────────────────
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const [, k, vRaw] = m;
    if (process.env[k] !== undefined) continue;
    const v = vRaw.replace(/^['"]|['"]$/g, '');
    process.env[k] = v;
  }
}
loadEnvFile(path.join(ROOT, '.env.local'));

// ─── 2. CLI args ───────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) {
      const next = arr[i + 1];
      const val  = next && !next.startsWith('--') ? next : 'true';
      acc.push([cur.slice(2), val]);
    }
    return acc;
  }, []),
);
const LIMIT   = Math.max(1, Number(args.limit ?? 500));
const SOURCE  = (args.source ?? 'all').toLowerCase();
const DRY_RUN = args['dry-run'] === 'true';
const OUT     = args.out ?? null;

const wantGithub = SOURCE === 'all' || SOURCE === 'github';
const wantSecop  = SOURCE === 'all' || SOURCE === 'secop';

// ─── 3. Hash + sintéticos (mirror de src/lib/consultores-enrich.ts) ────────
function cyrb53(input, seed = 0x9e3779b9) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
const pick = (seed, salt, mod) => cyrb53(`${salt}:${seed}`) % mod;
const syntheticAge   = (s) => 25 + pick(s, 'age', 30);
const syntheticPhone = (s) => {
  const b = pick(s, 'phone', 1_000_000_000).toString().padStart(9, '0');
  return `+57 3${b.slice(0,2)} ${b.slice(2,5)} ${b.slice(5,9)}`;
};
const syntheticRate  = (s) => 80_000 + pick(s, 'rate', 221) * 1_000;
const syntheticRating= (s) => Number((3.8 + pick(s, 'rating', 13) / 10).toFixed(1));
const diceBearAvatar = (s) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(s.slice(0,64))}&backgroundType=gradientLinear`;

const ROL_DESDE_CATEGORIA = [
  [/recursos humanos|selecci[oó]n|talento/i,         'Consultor de Talento'],
  [/asesor[ií]a de gesti[oó]n|administraci[oó]n/i,   'Consultor de Estrategia'],
  [/legales?|jur[ií]dico/i,                          'Abogado Corporativo'],
  [/ingenier[ií]a|arquitectura/i,                    'Ingeniero Consultor'],
  [/inform[aá]ticos?|software|datos/i,               'Desarrollador / Ingeniero de Datos'],
  [/contabilidad|auditor/i,                          'Contador Público'],
  [/salud|m[eé]dic/i,                                'Consultor de Salud'],
  [/publicidad|marketing|comunicaci[oó]n/i,          'Especialista en Marketing'],
  [/educaci[oó]n|formaci[oó]n/i,                     'Consultor en Educación'],
  [/medioambient/i,                                  'Consultor Ambiental'],
];
const KEYWORDS_BIO = [
  [/\b(react|next\.?js|frontend|front-?end)\b/i,                 'Frontend Developer'],
  [/\b(node\.?js|backend|back-?end|api)\b/i,                     'Backend Developer'],
  [/\b(full[- ]?stack|fullstack)\b/i,                            'Full Stack Developer'],
  [/\b(devops|sre|kubernetes|docker|aws|gcp|azure|cloud)\b/i,    'DevOps / Cloud Engineer'],
  [/\b(data[- ]?(scien|engineer)|machine learning|ml|ia|ai)\b/i, 'Data / AI Specialist'],
  [/\b(ux|ui|product design|diseño)\b/i,                          'UX / UI Designer'],
  [/\b(mobile|android|ios|flutter|react native)\b/i,             'Mobile Developer'],
  [/\b(qa|tester|quality)\b/i,                                    'QA Engineer'],
  [/\b(security|seguridad|pentest)\b/i,                          'Security Specialist'],
  [/\b(product manager|pm\b|producto)\b/i,                       'Product Manager'],
];
function inferRol({ bio = '', categoria = '', fallback }) {
  if (categoria) for (const [re, r] of ROL_DESDE_CATEGORIA) if (re.test(categoria)) return r;
  if (bio) for (const [re, r] of KEYWORDS_BIO) if (re.test(bio)) return r;
  return fallback ?? 'Consultor Independiente';
}
const EXPERTISE_TAGS = [
  [/\breact\b/i, 'react'], [/\bnext\.?js\b/i, 'nextjs'], [/\bnode\.?js\b/i, 'nodejs'],
  [/\btypescript\b/i, 'typescript'], [/\bjavascript\b/i, 'javascript'],
  [/\bpython\b/i, 'python'], [/\bgo(lang)?\b/i, 'go'], [/\bjava\b/i, 'java'],
  [/\baws\b/i, 'aws'], [/\bgcp\b/i, 'gcp'], [/\bazure\b/i, 'azure'],
  [/\bdocker\b/i, 'docker'], [/\bkubernetes\b/i, 'kubernetes'],
  [/\b(sql|postgres|mysql)\b/i, 'sql'], [/\b(nosql|mongo\w*)\b/i, 'nosql'],
  [/\bdata\b/i, 'data'], [/\b(ml|ia|ai)\b|machine learning|inteligencia artificial/i, 'ia'],
  [/\bdevops\b/i, 'devops'],
  [/\b(ux)\b|user experience/i, 'ux'], [/\b(ui)\b|user interface|diseño/i, 'ui'],
  [/\b(mobile|android|flutter)\b|\bios\b|react native/i, 'mobile'],
  [/recursos humanos|talento|selecci[oó]n/i, 'rrhh'],
  [/legal|jur[ií]dico|abogad/i, 'legal'],
  [/contabilidad|auditor/i, 'contabilidad'],
  [/marketing|publicidad/i, 'marketing'],
  [/finanzas|financier|inversi/i, 'finanzas'],
  [/ingenier[ií]a|arquitectura/i, 'ingenieria'],
  [/salud|m[eé]dic/i, 'salud'],
];
function inferExpertise({ bio = '', categoria = '' }) {
  const hay = `${bio} ${categoria}`;
  const set = new Set();
  for (const [re, tag] of EXPERTISE_TAGS) if (re.test(hay)) set.add(tag);
  return Array.from(set).slice(0, 8);
}

// ─── 4. Helpers de mapeo ───────────────────────────────────────────────────
const EMPTY = new Set(['No Definido', 'No Provisto', '-', '.', '']);
const FAKE_NITS = new Set(['No Definido', '0', '00', '000', '0000', '00000', '-', 'No Provisto']);
const GARBAGE_NAME = /^[^A-Za-záéíóúÁÉÍÓÚñÑ]/;
const CIUDAD_DISPLAY = {
  BOGOTa: 'Bogotá', MEDELLiN: 'Medellín', CALI: 'Cali', BARRANQUILLA: 'Barranquilla',
  CARTAGENA: 'Cartagena', BUCARAMANGA: 'Bucaramanga', IBAGUe: 'Ibagué',
  VILLAVICENCIO: 'Villavicencio', PEREIRA: 'Pereira', PASTO: 'Pasto',
};
const CIUDAD_GH = [
  [/bogot[aá]/i, 'Bogotá'], [/medell[ií]n/i, 'Medellín'], [/\bcali\b/i, 'Cali'],
  [/barranquilla/i, 'Barranquilla'], [/cartagena/i, 'Cartagena'],
  [/bucaramanga/i, 'Bucaramanga'], [/iba(gué|gue)/i, 'Ibagué'],
  [/pereira/i, 'Pereira'], [/pasto/i, 'Pasto'], [/villavicencio/i, 'Villavicencio'],
  [/manizales/i, 'Manizales'], [/santa marta/i, 'Santa Marta'],
  [/c[uú]cuta/i, 'Cúcuta'], [/popay[aá]n/i, 'Popayán'],
];
const clean = (v) => {
  const t = (v ?? '').toString().trim();
  return EMPTY.has(t) ? '' : t;
};
const titleCase = (s) => s.toLowerCase().replace(/\b([a-záéíóúñ])/g, (m) => m.toUpperCase());
function splitNombre(full, fallback) {
  const raw = (full ?? '').toString().trim();
  if (!raw) return { nombre: fallback ?? '', apellido: '' };
  const parts = raw.split(/\s+/);
  if (parts.length <= 1) return { nombre: raw, apellido: '' };
  const cut = Math.max(1, parts.length - 2);
  return { nombre: parts.slice(0, cut).join(' '), apellido: parts.slice(cut).join(' ') };
}
function parseCiudadGh(loc) {
  if (!loc) return '';
  for (const [re, d] of CIUDAD_GH) if (re.test(loc)) return d;
  return '';
}
function yearsSince(iso) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.min(25, Math.max(0, Math.floor((Date.now() - t) / (365.25 * 24 * 3600 * 1000))));
}

// ─── 5. Fetchers ───────────────────────────────────────────────────────────
const SOCRATA_URL = 'https://www.datos.gov.co/resource/4ex9-j3n8.json';
const CATEGORIAS = [
  'Servicios de recursos humanos',
  'Servicios de asesoría de gestión',
  'Servicios legales',
  'Servicios profesionales de ingeniería y arquitectura',
  'Servicios de administración de empresas',
  'Servicios integrales de salud',
  'Formación profesional',
  'Servicios informáticos',
  'Servicios de contabilidad y auditorias',
  'Gestión medioambiental',
  'Publicidad',
];

async function fetchSecop(limit) {
  const out = [];
  const pageSize = 500;
  let offset = 0;
  const inList = CATEGORIAS.map((c) => `'${c.replace(/'/g, "''")}'`).join(',');
  const where = [
    "esta_activa='Si'",
    "tipo_entidad='PERSONA NATURAL COLOMBIANA'",
    "correo_electronico IS NOT NULL",
    `descripci_n_categoria_principal IN (${inList})`,
  ].join(' AND ');

  while (out.length < limit) {
    const remaining = limit - out.length;
    const take = Math.min(pageSize, remaining);
    const params = new URLSearchParams({
      $select: 'nombre_entidad,nit_entidad,correo_electronico,ciudad,departamento,feacha_de_creacion,descripci_n_categoria_principal',
      $where:  where,
      $order:  'nombre_entidad ASC',
      $limit:  String(take),
      $offset: String(offset),
    });
    const headers = { Accept: 'application/json' };
    if (process.env.SOCRATA_APP_TOKEN) headers['X-App-Token'] = process.env.SOCRATA_APP_TOKEN;
    const res = await fetch(`${SOCRATA_URL}?${params}`, { headers });
    if (!res.ok) throw new Error(`SECOP ${res.status}: ${await res.text()}`);
    const rows = await res.json();
    if (!rows.length) break;
    for (const r of rows) {
      const name = clean(r.nombre_entidad);
      const nit  = clean(r.nit_entidad);
      if (!name || GARBAGE_NAME.test(name)) continue;
      if (!nit || FAKE_NITS.has(nit) || nit.length < 6) continue;
      const email = clean(r.correo_electronico).toLowerCase();
      if (!email) continue;

      const fullName = titleCase(name);
      const { nombre, apellido } = splitNombre(fullName);
      const ciudadRaw = clean(r.ciudad);
      const ciudad = CIUDAD_DISPLAY[ciudadRaw] ?? titleCase(ciudadRaw);
      const departamento = titleCase(clean(r.departamento));
      const categoria = clean(r.descripci_n_categoria_principal);
      const rol = inferRol({ categoria, fallback: 'Consultor Profesional' });
      const expertise = inferExpertise({ categoria });
      const bio = ciudad
        ? `${rol} con sede en ${ciudad}, especializado en ${categoria.toLowerCase()}.`
        : `${rol} especializado en ${categoria.toLowerCase()}.`;
      out.push({
        idExterno: nit,
        fuente:    'secop',
        nombre, apellido,
        email,
        telefono: syntheticPhone(nit),
        rol, bio,
        especialidad: categoria,
        expertise,
        ciudad, departamento,
        avatarUrl: diceBearAvatar(fullName || nit),
        experienciaAnos: 1 + (Math.abs((nit.charCodeAt(0) || 0) * 31 + nit.length) % 20),
        tarifaReferencial: syntheticRate(nit),
        rating: syntheticRating(nit),
        edad:   syntheticAge(nit),
        estado: 'disponible',
        verified: true,
        fechaRegistro: clean(r.feacha_de_creacion) || null,
      });
      if (out.length >= limit) break;
    }
    offset += take;
    if (rows.length < take) break;
  }
  return out;
}

const GH_API = 'https://api.github.com';
function ghHeaders() {
  const h = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'nexora-app/1.0',
  };
  if (process.env.GITHUB_PAT) h.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
  return h;
}
async function ghFetch(url) {
  const res = await fetch(url, { headers: ghHeaders() });
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000;
    const wait = Math.max(0, reset - Date.now());
    if (wait && wait < 90_000) {
      console.warn(`  ↳ rate limit, esperando ${Math.ceil(wait/1000)}s…`);
      await new Promise((r) => setTimeout(r, wait + 500));
      return ghFetch(url);
    }
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  return res.json();
}
async function fetchGithub(limit) {
  const out = [];
  const seen = new Set();
  const perPage = 100;
  for (let page = 1; out.length < limit && page <= 10; page += 1) {
    const url = `${GH_API}/search/users?q=${encodeURIComponent('location:colombia type:user')}&per_page=${perPage}&page=${page}`;
    const search = await ghFetch(url);
    if (!search.items?.length) break;
    for (const u of search.items) {
      if (u.type !== 'User' || seen.has(u.login)) continue;
      seen.add(u.login);
      try {
        const d = await ghFetch(`${GH_API}/users/${u.login}`);
        if (d.type !== 'User') continue;
        const hasName = (d.name ?? '').trim();
        const hasBio  = (d.bio  ?? '').trim();
        if (!hasName && !hasBio) continue;
        const fullName = hasName || d.login;
        const { nombre, apellido } = splitNombre(d.name, d.login);
        const bio = hasBio || `Profesional independiente en GitHub (@${d.login}).`;
        const rol = inferRol({ bio, fallback: 'Software Engineer' });
        out.push({
          idExterno: d.login,
          fuente:    'github',
          nombre, apellido,
          email:    d.email ?? null,
          telefono: syntheticPhone(d.login),
          rol, bio,
          especialidad: rol,
          expertise: inferExpertise({ bio }),
          ciudad:    parseCiudadGh(d.location),
          departamento: '',
          avatarUrl: d.avatar_url || diceBearAvatar(fullName),
          experienciaAnos: yearsSince(d.created_at),
          tarifaReferencial: syntheticRate(d.login),
          rating: syntheticRating(d.login),
          edad:   syntheticAge(d.login),
          estado: d.hireable ? 'disponible' : 'ocupado',
          verified: false,
          fechaRegistro: d.created_at ?? null,
        });
        if (out.length >= limit) break;
      } catch (err) {
        console.warn(`  ↳ skip @${u.login}: ${err.message}`);
      }
    }
  }
  return out;
}

// ─── 6. Upsert a Supabase ──────────────────────────────────────────────────
function toRow(c) {
  return {
    nombre:             c.nombre,
    apellido:           c.apellido,
    email:              c.email,
    telefono:           c.telefono,
    especialidad:       c.especialidad,
    'años_experiencia': c.experienciaAnos,
    tarifa_referencial: c.tarifaReferencial,
    estado:             c.estado,
    fecha_registro:     c.fechaRegistro,
    ciudad:             c.ciudad || null,
    avatar_url:         c.avatarUrl,
    bio:                c.bio,
    rol:                c.rol,
    expertise:          c.expertise,
    verified:           c.verified,
    fuente:             c.fuente,
    id_externo:         c.idExterno,
  };
}

// Estrategia delete + insert por lote: equivale a upsert pero no
// requiere índice único como ON CONFLICT target (que Supabase JS sólo
// acepta cuando el índice es NO parcial). Es idempotente por (fuente,
// id_externo) y mantiene el conteo estable en re-corridas.
async function upsertBatch(client, rows) {
  if (!rows.length) return;
  const fuentes = [...new Set(rows.map((r) => r.fuente))];
  for (const fuente of fuentes) {
    const ids = rows.filter((r) => r.fuente === fuente).map((r) => r.id_externo);
    const { error: delErr } = await client
      .from('consultor')
      .delete()
      .eq('fuente', fuente)
      .in('id_externo', ids);
    if (delErr) throw delErr;
  }
  const { error: insErr } = await client.from('consultor').insert(rows);
  if (insErr) throw insErr;
}

// ─── 7. Main ───────────────────────────────────────────────────────────────
async function main() {
  console.log(`▸ seed-consultores — limit=${LIMIT} source=${SOURCE} dry-run=${DRY_RUN}`);

  // Reparto: ~70% GitHub, ~30% SECOP cuando hay ambas fuentes.
  const ghLimit    = wantGithub ? (wantSecop ? Math.ceil(LIMIT * 0.7) : LIMIT) : 0;
  const secopLimit = wantSecop  ? (wantGithub ? Math.floor(LIMIT * 0.3) : LIMIT) : 0;

  const collected = [];
  if (ghLimit > 0) {
    console.log(`  · GitHub: hasta ${ghLimit} perfiles…`);
    const gh = await fetchGithub(ghLimit);
    console.log(`    ↳ ${gh.length} válidos`);
    collected.push(...gh);
  }
  if (secopLimit > 0) {
    console.log(`  · SECOP:  hasta ${secopLimit} perfiles…`);
    const sec = await fetchSecop(secopLimit);
    console.log(`    ↳ ${sec.length} válidos`);
    collected.push(...sec);
  }

  // Dedup defensivo por (fuente, idExterno)
  const seen = new Set();
  const all = collected.filter((c) => {
    const k = `${c.fuente}:${c.idExterno}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  console.log(`▸ Total único: ${all.length}`);

  if (OUT) {
    const outPath = path.isAbsolute(OUT) ? OUT : path.join(ROOT, OUT);
    fs.writeFileSync(outPath, JSON.stringify(all, null, 2));
    console.log(`▸ JSON escrito en ${outPath}`);
  }

  if (DRY_RUN) {
    console.log('▸ dry-run: no se upserta a Supabase. Done.');
    return;
  }

  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('✖ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exitCode = 1;
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const BATCH = 50;
  let upserted = 0;
  for (let i = 0; i < all.length; i += BATCH) {
    const chunk = all.slice(i, i + BATCH).map(toRow);
    try {
      await upsertBatch(supabase, chunk);
      upserted += chunk.length;
      process.stdout.write(`\r  · upserted ${upserted}/${all.length}`);
    } catch (err) {
      console.error(`\n✖ batch ${i}-${i+BATCH} falló: ${err.message ?? err}`);
    }
  }
  process.stdout.write('\n');
  console.log(`✓ Listo. ${upserted} filas upserteadas en public.consultor.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
