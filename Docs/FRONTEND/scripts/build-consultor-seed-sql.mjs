#!/usr/bin/env node
// Genera Docs/BASE_DATOS/migrations/20260516_consultor_seed_bulk.sql
// desde Docs/FRONTEND/src/lib/muestra-consultores.json. Idempotente:
// re-correrlo regenera el archivo. Patrón espejo del de empresas
// (20260513_empresa_seed_bulk.sql).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const REPO      = path.resolve(ROOT, '..', '..');

const IN  = path.join(ROOT, 'src/lib/muestra-consultores.json');
const OUT = path.join(REPO, 'Docs/BASE_DATOS/migrations/20260516_consultor_seed_bulk.sql');

function esc(s) {
  if (s === null || s === undefined) return 'NULL';
  return `'${String(s).replace(/'/g, "''")}'`;
}
function num(n) {
  return n === null || n === undefined || Number.isNaN(n) ? 'NULL' : String(n);
}
function bool(b) { return b ? 'true' : 'false'; }
function arr(a) {
  if (!a || !a.length) return `'{}'`;
  return `'{${a.map((x) => `"${String(x).replace(/"/g, '\\"')}"`).join(',')}}'`;
}

const data = JSON.parse(fs.readFileSync(IN, 'utf8'));
const COLS = [
  'nombre','apellido','email','telefono','especialidad','años_experiencia',
  'tarifa_referencial','estado','fecha_registro','ciudad',
  'avatar_url','bio','rol','expertise','verified','fuente','id_externo',
];

const lines = [];
lines.push('-- Seed: 200 consultores reales (SECOP — PERSONA NATURAL COLOMBIANA)');
lines.push(`-- Generado desde Docs/FRONTEND/src/lib/muestra-consultores.json`);
lines.push('-- Prerequisito: 20260516_consultor_datos_extras.sql aplicada');
lines.push('-- Fecha: 2026-05-16');
lines.push('');
lines.push('begin;');
lines.push('');
lines.push(`insert into public.consultor (`);
lines.push('  ' + COLS.map((c) => c.includes('ñ') ? `"${c}"` : c).join(',\n  '));
lines.push(') values');

const valueRows = data.map((c) => {
  const cells = [
    esc(c.nombre),
    esc(c.apellido),
    esc(c.email),
    esc(c.telefono),
    esc(c.especialidad),
    num(c.experienciaAnos),
    num(c.tarifaReferencial),
    esc(c.estado),
    esc(c.fechaRegistro),
    esc(c.ciudad || null),
    esc(c.avatarUrl),
    esc(c.bio),
    esc(c.rol),
    arr(c.expertise),
    bool(c.verified),
    esc(c.fuente),
    esc(c.idExterno),
  ];
  return '  (' + cells.join(',') + ')';
});
lines.push(valueRows.join(',\n'));
lines.push('on conflict (fuente, id_externo) do update set');
lines.push('  nombre              = excluded.nombre,');
lines.push('  apellido            = excluded.apellido,');
lines.push('  email               = excluded.email,');
lines.push('  telefono            = excluded.telefono,');
lines.push('  especialidad        = excluded.especialidad,');
lines.push('  "años_experiencia"  = excluded."años_experiencia",');
lines.push('  tarifa_referencial  = excluded.tarifa_referencial,');
lines.push('  estado              = excluded.estado,');
lines.push('  fecha_registro      = excluded.fecha_registro,');
lines.push('  ciudad              = excluded.ciudad,');
lines.push('  avatar_url          = excluded.avatar_url,');
lines.push('  bio                 = excluded.bio,');
lines.push('  rol                 = excluded.rol,');
lines.push('  expertise           = excluded.expertise,');
lines.push('  verified            = excluded.verified;');
lines.push('');
lines.push('commit;');
lines.push('');

fs.writeFileSync(OUT, lines.join('\n'));
console.log(`✓ ${OUT} escrito (${data.length} consultores).`);
