-- Catálogo de empresas colombianas cargado desde datos.gov.co (RUES/Confecámaras)
-- Usado como referencia de mercado; no contiene usuarios autenticados de Nexora.

create table if not exists public.companies_catalog (
  nit               text primary key,
  razon_social      text not null,
  ciudad            text,
  departamento      text,
  ciiu              text,
  sector            text,
  activos           bigint default 0,
  tipo_organizacion text,
  fuente            text not null default 'datos.gov.co',
  cargado_at        timestamptz not null default now()
);

create index if not exists idx_companies_catalog_ciudad
  on public.companies_catalog (ciudad);

create index if not exists idx_companies_catalog_ciiu
  on public.companies_catalog (ciiu);

-- Búsqueda full-text por razón social en español
create index if not exists idx_companies_catalog_nombre_fts
  on public.companies_catalog
  using gin (to_tsvector('spanish', razon_social));

-- Lectura pública para usuarios autenticados (solo lectura, sin escritura desde cliente)
alter table public.companies_catalog enable row level security;

create policy "companies_catalog_select"
  on public.companies_catalog
  for select
  to authenticated
  using (true);
