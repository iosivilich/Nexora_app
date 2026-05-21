// Generación determinística de campos que ninguna fuente externa provee
// (telefono, edad, tarifa, rating) y de campos derivables (rol, expertise).
// Mismo input → mismo output: el seed es reproducible.

// Hash 53-bit estable (Bryc) — sin depender de crypto en el cliente.
function cyrb53(input: string, seed = 0x9e3779b9): number {
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

function pick(seed: string, salt: string, mod: number): number {
  return cyrb53(`${salt}:${seed}`) % mod;
}

export function syntheticAge(seed: string): number {
  // 25–54 años (rango típico de consultores profesionales).
  return 25 + pick(seed, 'age', 30);
}

export function syntheticPhone(seed: string): string {
  // Formato móvil colombiano: +57 3XX XXX XXXX
  const block = pick(seed, 'phone', 1_000_000_000).toString().padStart(9, '0');
  return `+57 3${block.slice(0, 2)} ${block.slice(2, 5)} ${block.slice(5, 9)}`;
}

export function syntheticRate(seed: string): number {
  // Tarifa hora 80K–300K COP.
  return 80_000 + pick(seed, 'rate', 221) * 1_000;
}

export function syntheticRating(seed: string): number {
  // 3.8–5.0 con un decimal — todos en zona alta para no ensuciar la UX.
  const tenths = pick(seed, 'rating', 13);
  return Number((3.8 + tenths / 10).toFixed(1));
}

const ROL_DESDE_CATEGORIA: Array<[RegExp, string]> = [
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
  [/financier|inversi/i,                             'Consultor Financiero'],
];

const KEYWORDS_BIO: Array<[RegExp, string]> = [
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

export function inferRol(opts: { bio?: string; categoria?: string; fallback?: string }): string {
  const { bio = '', categoria = '', fallback = 'Consultor Independiente' } = opts;
  if (categoria) {
    for (const [re, rol] of ROL_DESDE_CATEGORIA) {
      if (re.test(categoria)) return rol;
    }
  }
  if (bio) {
    for (const [re, rol] of KEYWORDS_BIO) {
      if (re.test(bio)) return rol;
    }
  }
  return fallback;
}

export function inferExpertise(opts: { bio?: string; categoria?: string }): string[] {
  const { bio = '', categoria = '' } = opts;
  const found = new Set<string>();
  const tags: Array<[RegExp, string]> = [
    [/\breact\b/i, 'react'], [/\bnext\.?js\b/i, 'nextjs'], [/\bnode\.?js\b/i, 'nodejs'],
    [/\btypescript\b/i, 'typescript'], [/\bjavascript\b/i, 'javascript'],
    [/\bpython\b/i, 'python'], [/\bgo(lang)?\b/i, 'go'], [/\bjava\b/i, 'java'],
    [/\baws\b/i, 'aws'], [/\bgcp\b/i, 'gcp'], [/\bazure\b/i, 'azure'],
    [/\bdocker\b/i, 'docker'], [/\bkubernetes\b/i, 'kubernetes'],
    [/\b(sql|postgres|mysql)\b/i, 'sql'], [/\b(nosql|mongo\w*)\b/i, 'nosql'],
    [/\bdata\b/i, 'data'], [/\b(ml|ia|ai)\b|machine learning|inteligencia artificial/i, 'ia'],
    [/\bdevops\b/i, 'devops'], [/\bsre\b/i, 'sre'],
    [/\b(ux)\b|user experience/i, 'ux'], [/\b(ui)\b|user interface|diseño/i, 'ui'],
    [/\b(mobile|android|flutter)\b|\bios\b|react native/i, 'mobile'],
    [/recursos humanos|talento|selecci[oó]n/i, 'rrhh'],
    [/legal|jur[ií]dico|abogad/i, 'legal'],
    [/contabilidad|auditor/i, 'contabilidad'],
    [/marketing|publicidad/i, 'marketing'],
    [/finanzas|financier|inversi/i, 'finanzas'],
    [/ingenier[ií]a|arquitectura/i, 'ingenieria'],
    [/salud|m[eé]dic/i, 'salud'],
    [/educaci[oó]n|formaci[oó]n/i, 'educacion'],
    [/medioambient|sostenibilidad/i, 'medioambiente'],
    [/estrategia|gerencia|administraci[oó]n/i, 'estrategia'],
  ];
  const haystack = `${bio} ${categoria}`;
  for (const [re, tag] of tags) {
    if (re.test(haystack)) found.add(tag);
  }
  return Array.from(found).slice(0, 8);
}

export function diceBearAvatar(seed: string): string {
  // DiceBear v9, sin auth, free, deterministic.
  const safe = encodeURIComponent(seed.slice(0, 64));
  return `https://api.dicebear.com/9.x/initials/svg?seed=${safe}&backgroundType=gradientLinear`;
}
