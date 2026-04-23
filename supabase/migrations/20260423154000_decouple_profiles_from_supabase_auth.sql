begin;

alter table public.profiles
  alter column id set default gen_random_uuid();

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

commit;
