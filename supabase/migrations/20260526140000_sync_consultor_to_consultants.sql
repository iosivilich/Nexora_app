-- Sync: por cada fila del catálogo `consultor` (SECOP/GitHub), crear el
-- triple correspondiente en (profiles, consultants) y guardar el UUID en
-- `consultor.profile_id` para mantener el mapping idempotente.
--
-- Sin esto los consultores del catálogo no aparecen en /explorar, Nexa AI,
-- favoritos, mensajería, etc. (todo eso consulta `consultants`, no `consultor`).
--
-- Fecha: 2026-05-26

begin;

-- 1. Columna de mapping (idempotente)
alter table public.consultor
  add column if not exists profile_id uuid;

-- 2. La tabla `consultants` no tenía `ciudad` en el schema inicial; añadirla
--    antes del INSERT para evitar errores de columna inexistente.
alter table public.consultants
  add column if not exists ciudad text;

-- 3. Loop: solo para filas todavía sin profile_id
do $$
declare
  c record;
  new_id uuid;
  display_name text;
begin
  for c in
    select * from public.consultor
    where profile_id is null
      and nombre is not null
  loop
    new_id := gen_random_uuid();
    display_name := nullif(trim(coalesce(c.nombre, '') || ' ' || coalesce(c.apellido, '')), '');

    -- Profile sintético (no ligado a auth.users)
    insert into public.profiles (
      id,
      full_name,
      avatar_url,
      city,
      user_type,
      consultor_id,
      auth_provider,
      auth_subject,
      primary_email,
      updated_at
    ) values (
      new_id,
      coalesce(display_name, 'Consultor'),
      coalesce(c.avatar_url, ''),
      c.ciudad,
      'CONSULTOR',
      c.id_consultor,
      'seed',
      'seed:consultor:' || c.id_consultor,
      lower(c.email),
      now()
    )
    on conflict (id) do nothing;

    -- Consultants (auth-linked table consumida por el resto de la app)
    insert into public.consultants (
      id,
      role,
      rating,
      projects,
      experience_years,
      bio,
      expertise,
      verified,
      ciudad,
      updated_at
    ) values (
      new_id,
      coalesce(c.rol, c.especialidad),
      coalesce(c.rating, 4.5),
      0,
      c."años_experiencia",
      c.bio,
      coalesce(c.expertise, '{}'),
      coalesce(c.verified, false),
      c.ciudad,
      now()
    )
    on conflict (id) do nothing;

    -- Persistir mapping
    update public.consultor
      set profile_id = new_id
      where id_consultor = c.id_consultor;
  end loop;
end $$;

commit;
