import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data, error } = await sb.from('consultor').select('id_consultor, fuente, id_externo, avatar_url, expertise').limit(1);
if (error) { console.log('SCHEMA-ERROR:', error.code, error.message); process.exit(2); }
console.log('SCHEMA-OK. existing rows sample:', JSON.stringify(data));
const { count } = await sb.from('consultor').select('*', { count: 'exact', head: true });
console.log('current count:', count);
