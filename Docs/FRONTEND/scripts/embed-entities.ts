// Backfill de embeddings semánticos (multilingual-e5-small) para consultor y empresa.
// Uso:
//   cd Docs/FRONTEND
//   npx tsx scripts/embed-entities.ts --table empresa     --limit 100
//   npx tsx scripts/embed-entities.ts --table consultor   --limit 100
// Requiere HUGGINGFACE_API_TOKEN, NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.

import { config as loadEnv } from 'dotenv';
import path from 'node:path';
loadEnv({ path: path.join(process.cwd(), '.env.local') });
loadEnv({ path: path.join(process.cwd(), '.env') });
import { createClient } from '@supabase/supabase-js';
import { embedText, pgVectorLiteral } from '../src/lib/embeddings';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
if (!process.env.HUGGINGFACE_API_TOKEN) {
  console.error('Falta HUGGINGFACE_API_TOKEN.');
  process.exit(1);
}

const args = process.argv.slice(2);
function getArg(name: string, fallback: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
}

const table = getArg('table', 'empresa') as 'empresa' | 'consultor';
const limit = Number(getArg('limit', '100'));

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function processEmpresas() {
  const { data, error } = await supabase
    .from('empresa')
    .select('id_empresa, nombre_empresa, sector, descripcion')
    .is('embedding', null)
    .limit(limit);
  if (error) throw error;

  console.log(`Empresas pendientes: ${data?.length ?? 0}`);
  let ok = 0;
  for (const row of data ?? []) {
    const passage = [row.nombre_empresa, row.sector, row.descripcion].filter(Boolean).join(' ');
    if (!passage.trim()) continue;
    const vector = await embedText(passage, 'passage');
    if (!vector) continue;
    const { error: updateError } = await supabase
      .from('empresa')
      .update({
        embedding: pgVectorLiteral(vector),
        embedding_updated_at: new Date().toISOString(),
      })
      .eq('id_empresa', row.id_empresa);
    if (updateError) {
      console.error(`Error #${row.id_empresa}:`, updateError.message);
    } else {
      ok += 1;
      console.log(`#${row.id_empresa} "${row.nombre_empresa?.slice(0, 40)}" embebido`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`Listo: ${ok}/${data?.length ?? 0} embebidos.`);
}

async function processConsultores() {
  const { data, error } = await supabase
    .from('consultor')
    .select('id_consultor, nombre, apellido, rol, especialidad, bio, expertise')
    .is('embedding', null)
    .limit(limit);
  if (error) throw error;

  console.log(`Consultores pendientes: ${data?.length ?? 0}`);
  let ok = 0;
  for (const row of data ?? []) {
    const passage = [row.rol, row.especialidad, row.bio, ...(row.expertise ?? [])]
      .filter(Boolean)
      .join(' ');
    if (!passage.trim()) continue;
    const vector = await embedText(passage, 'passage');
    if (!vector) continue;
    const { error: updateError } = await supabase
      .from('consultor')
      .update({
        embedding: pgVectorLiteral(vector),
        embedding_updated_at: new Date().toISOString(),
      })
      .eq('id_consultor', row.id_consultor);
    if (updateError) {
      console.error(`Error #${row.id_consultor}:`, updateError.message);
    } else {
      ok += 1;
      console.log(`#${row.id_consultor} ${row.nombre} ${row.apellido ?? ''} embebido`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log(`Listo: ${ok}/${data?.length ?? 0} embebidos.`);
}

(async () => {
  try {
    if (table === 'empresa') await processEmpresas();
    else if (table === 'consultor') await processConsultores();
    else {
      console.error(`Tabla desconocida: ${table}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Falló el backfill:', error);
    process.exit(1);
  }
})();
