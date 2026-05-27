-- Migración: campos para sistema de recomendación
-- Añade columnas de claridad de razón social usadas por el recomendador
-- para premiar empresas con un nombre que describe claramente su actividad.
-- Fecha: 2026-05-26

begin;

-- 1. Empresa autenticada: claridad de la razón social activa
alter table public.empresa
  add column if not exists razon_social_clarity         numeric,
  add column if not exists razon_social_clarity_explain text,
  add column if not exists razon_social_clarity_at      timestamptz;

-- 2. Catálogo de mercado (si existe en este proyecto)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'companies_catalog'
  ) then
    execute 'alter table public.companies_catalog
              add column if not exists razon_social_clarity         numeric,
              add column if not exists razon_social_clarity_explain text,
              add column if not exists razon_social_clarity_at      timestamptz';
  end if;
end $$;

commit;
