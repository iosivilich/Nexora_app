-- Migración: enriquecer tabla consultor con campos para ingesta masiva
-- desde GitHub Users API + SECOP (datos.gov.co PERSONA NATURAL).
-- Fecha: 2026-05-16

begin;

-- Campos adicionales para soportar avatar real, bio rica, expertise
-- multi-valor y trazabilidad de la fuente externa.
alter table public.consultor
  add column if not exists avatar_url text,
  add column if not exists bio        text,
  add column if not exists rol        text,
  add column if not exists expertise  text[] not null default '{}',
  add column if not exists verified   boolean not null default false,
  add column if not exists fuente     text,
  add column if not exists id_externo text;

-- Índice único (no parcial) sobre (fuente, id_externo). Postgres trata
-- NULLs como distintos por defecto: las filas legacy con ambos NULL no
-- colisionan entre sí. El índice se usa como target de ON CONFLICT, por
-- lo que NO puede ser parcial (Postgres rechaza índices parciales como
-- arbiter de upsert salvo que se reproduzca el predicado).
drop index if exists public.consultor_fuente_externo_unique_idx;
create unique index if not exists consultor_fuente_externo_unique_idx
  on public.consultor (fuente, id_externo);

commit;
