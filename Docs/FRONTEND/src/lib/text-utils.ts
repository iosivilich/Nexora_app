const SPANISH_STOPWORDS = new Set([
  'a', 'al', 'algo', 'algun', 'alguna', 'algunas', 'alguno', 'algunos', 'ante', 'antes',
  'aqui', 'aunque', 'cada', 'como', 'con', 'contra', 'cual', 'cuales', 'cuando', 'de',
  'del', 'desde', 'donde', 'dos', 'el', 'ella', 'ellas', 'ellos', 'en', 'entre',
  'era', 'eran', 'eras', 'eres', 'es', 'esa', 'esas', 'ese', 'eso', 'esos',
  'esta', 'estaba', 'estan', 'estar', 'estas', 'este', 'esto', 'estos', 'fue', 'fueron',
  'ha', 'han', 'hasta', 'hay', 'la', 'las', 'le', 'les', 'lo', 'los',
  'mas', 'me', 'mi', 'mis', 'mucho', 'muchos', 'muy', 'nada', 'ni', 'no',
  'nos', 'nosotros', 'o', 'os', 'otra', 'otras', 'otro', 'otros', 'para', 'pero',
  'poco', 'por', 'porque', 'que', 'quien', 'quienes', 'se', 'sea', 'ser', 'si',
  'sin', 'sobre', 'solo', 'son', 'su', 'sus', 'tambien', 'tan', 'te', 'tener',
  'ti', 'tiene', 'todo', 'todos', 'tu', 'tus', 'un', 'una', 'unas', 'uno',
  'unos', 'y', 'ya', 'yo',
  // Tokens genéricos de razones sociales colombianas que no aportan señal
  'sas', 'sa', 'ltda', 'eu', 'sociedad', 'simplificada', 'limitada', 'anonima',
  'colombia', 'colombiana', 'compañia', 'compania', 'company', 'corporation',
  'corp', 'inc', 'group', 'grupo', 'co', 'cia',
]);

export function normalizeText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(value: string | null | undefined): string[] {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  const words = normalized.split(/\s+/).filter((token) => {
    if (token.length < 2) return false;
    if (SPANISH_STOPWORDS.has(token)) return false;
    return true;
  });
  // Añade bigramas para capturar frases como "data science"
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i += 1) {
    bigrams.push(`${words[i]}_${words[i + 1]}`);
  }
  return [...words, ...bigrams];
}

export function citiesMatch(a: string | null | undefined, b: string | null | undefined): number {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  // Subcadenas para casos "bogota" vs "bogota dc"
  if (left.includes(right) || right.includes(left)) return 0.8;
  return 0;
}

export function departmentMatch(a: string | null | undefined, b: string | null | undefined): number {
  const left = normalizeText(a);
  const right = normalizeText(b);
  if (!left || !right) return 0;
  return left === right ? 1 : 0;
}

export const stopwords = SPANISH_STOPWORDS;
