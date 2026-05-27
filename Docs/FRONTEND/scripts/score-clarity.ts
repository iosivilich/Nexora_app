// Backfill de razon_social_clarity para empresa + companies_catalog usando Groq.
// Uso:
//   cd Docs/FRONTEND
//   npx tsx scripts/score-clarity.ts --limit 100 [--table empresa|companies_catalog]
// Requiere GROQ_API_KEY y SUPABASE_SERVICE_ROLE_KEY en .env.local

import { config as loadEnv } from 'dotenv';
import path from 'node:path';
loadEnv({ path: path.join(process.cwd(), '.env.local') });
loadEnv({ path: path.join(process.cwd(), '.env') });
import { createClient } from '@supabase/supabase-js';
import { scoreRazonSocialClarity } from '../src/lib/razon-social-clarity';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

if (!process.env.GROQ_API_KEY) {
  console.error('Falta GROQ_API_KEY en .env.local.');
  process.exit(1);
}

const args = process.argv.slice(2);
function getArg(name: string, fallback: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : fallback;
}

const limit = Number(getArg('limit', '50'));
const table = getArg('table', 'empresa') as 'empresa' | 'companies_catalog';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function processEmpresa() {
  const { data, error } = await supabase
    .from('empresa')
    .select('id_empresa, nombre_empresa, sector, tipo_organizacion')
    .is('razon_social_clarity', null)
    .limit(limit);

  if (error) throw error;

  console.log(`Procesando ${data?.length ?? 0} empresas sin score…`);
  for (const row of data ?? []) {
    if (!row.nombre_empresa) continue;
    const score = await scoreRazonSocialClarity({
      razonSocial: row.nombre_empresa,
      sector: row.sector,
      tipoOrganizacion: row.tipo_organizacion,
    });
    if (!score) continue;
    const { error: updateError } = await supabase
      .from('empresa')
      .update({
        razon_social_clarity: score.clarity,
        razon_social_clarity_explain: score.explanation,
        razon_social_clarity_at: new Date().toISOString(),
      })
      .eq('id_empresa', row.id_empresa);
    if (updateError) {
      console.error(`Error actualizando id=${row.id_empresa}:`, updateError.message);
    } else {
      console.log(`#${row.id_empresa} "${row.nombre_empresa}" → ${score.clarity.toFixed(2)} (${score.explanation})`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function processCatalog() {
  const { data, error } = await supabase
    .from('companies_catalog')
    .select('nit, razon_social, sector, tipo_organizacion')
    .is('razon_social_clarity', null)
    .limit(limit);

  if (error) throw error;

  console.log(`Procesando ${data?.length ?? 0} entradas del catálogo…`);
  for (const row of data ?? []) {
    if (!row.razon_social) continue;
    const score = await scoreRazonSocialClarity({
      razonSocial: row.razon_social,
      sector: row.sector,
      tipoOrganizacion: row.tipo_organizacion,
    });
    if (!score) continue;
    const { error: updateError } = await supabase
      .from('companies_catalog')
      .update({
        razon_social_clarity: score.clarity,
        razon_social_clarity_explain: score.explanation,
        razon_social_clarity_at: new Date().toISOString(),
      })
      .eq('nit', row.nit);
    if (updateError) {
      console.error(`Error actualizando nit=${row.nit}:`, updateError.message);
    } else {
      console.log(`${row.nit} "${row.razon_social}" → ${score.clarity.toFixed(2)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

(async () => {
  try {
    if (table === 'empresa') await processEmpresa();
    else await processCatalog();
    console.log('Listo.');
  } catch (error) {
    console.error('Falló el backfill:', error);
    process.exit(1);
  }
})();
