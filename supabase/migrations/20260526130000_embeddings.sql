-- Migración: embeddings semánticos para recomendación ML
-- Modelo: intfloat/multilingual-e5-small (384 dimensiones).
-- Distancia: coseno (operador <=> con vector_cosine_ops).
-- Fecha: 2026-05-26

begin;

create extension if not exists vector;

-- Columnas que faltan en `consultor` para que el recomendador pueda exponerlas
alter table public.consultor
  add column if not exists departamento         text,
  add column if not exists rating               numeric;

alter table public.consultor
  add column if not exists embedding            vector(384),
  add column if not exists embedding_updated_at timestamptz;

alter table public.empresa
  add column if not exists embedding            vector(384),
  add column if not exists embedding_updated_at timestamptz;

create index if not exists idx_consultor_embedding
  on public.consultor using ivfflat (embedding vector_cosine_ops) with (lists = 50);

create index if not exists idx_empresa_embedding
  on public.empresa using ivfflat (embedding vector_cosine_ops) with (lists = 50);

-- RPC: top-K consultores por similitud coseno
drop function if exists public.match_consultores(vector, int);
create function public.match_consultores(
  query_embedding vector(384),
  match_count int default 40
)
returns table (
  id_consultor      int,
  nombre            text,
  apellido          text,
  rol               text,
  especialidad      text,
  bio               text,
  expertise         text[],
  ciudad            text,
  departamento      text,
  avatar_url        text,
  rating            numeric,
  verified          boolean,
  anos_experiencia  int,
  similarity        float
)
language sql stable as $$
  select
    id_consultor,
    nombre,
    apellido,
    rol,
    especialidad,
    bio,
    expertise,
    ciudad,
    departamento,
    avatar_url,
    rating,
    verified,
    "años_experiencia" as anos_experiencia,
    (1 - (embedding <=> query_embedding))::float as similarity
  from public.consultor
  where embedding is not null
  order by embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

-- RPC: top-K empresas por similitud coseno
drop function if exists public.match_empresas(vector, int);
create function public.match_empresas(
  query_embedding vector(384),
  match_count int default 40
)
returns table (
  id_empresa            int,
  nombre_empresa        text,
  sector                text,
  descripcion           text,
  ciudad                text,
  departamento          text,
  es_pyme               boolean,
  website               text,
  nit                   text,
  razon_social_clarity  numeric,
  similarity            float
)
language sql stable as $$
  select
    id_empresa,
    nombre_empresa,
    sector,
    descripcion,
    ciudad,
    departamento,
    es_pyme,
    website,
    nit,
    razon_social_clarity,
    (1 - (embedding <=> query_embedding))::float as similarity
  from public.empresa
  where embedding is not null
  order by embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

grant execute on function public.match_consultores(vector, int) to authenticated, anon;
grant execute on function public.match_empresas(vector, int)   to authenticated, anon;

commit;
