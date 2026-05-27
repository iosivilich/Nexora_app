-- Rollback manual del sistema de recomendación ML.
-- NO se ejecuta automáticamente. Aplicarlo a mano desde Supabase Studio si
-- queremos eliminar todo lo agregado por:
--   - 20260526120000_recommendation_fields.sql
--   - 20260526130000_embeddings.sql

begin;

-- 1. Funciones de matching vectorial
drop function if exists public.match_consultores(vector, int);
drop function if exists public.match_empresas(vector, int);

-- 2. Índices ivfflat
drop index if exists public.idx_consultor_embedding;
drop index if exists public.idx_empresa_embedding;

-- 3. Columnas de embeddings
alter table public.consultor
  drop column if exists embedding,
  drop column if exists embedding_updated_at;

alter table public.empresa
  drop column if exists embedding,
  drop column if exists embedding_updated_at;

-- 4. Columnas de claridad de razón social
alter table public.empresa
  drop column if exists razon_social_clarity,
  drop column if exists razon_social_clarity_explain,
  drop column if exists razon_social_clarity_at;

alter table public.companies_catalog
  drop column if exists razon_social_clarity,
  drop column if exists razon_social_clarity_explain,
  drop column if exists razon_social_clarity_at;

-- NOTA: dejamos la extensión `vector` instalada porque desinstalarla podría
-- afectar otros usos futuros y no aporta nada removerla.

commit;
