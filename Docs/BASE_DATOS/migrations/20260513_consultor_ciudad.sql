-- Migración: agregar ciudad a las dos tablas de consultores
-- Fecha: 2026-05-13

begin;

-- 1. Tabla consultants (auth-linked, UUID PK)
--    Agrega ciudad y la puebla desde profiles.city para registros existentes
alter table public.consultants
  add column if not exists ciudad text;

update public.consultants c
set ciudad = p.city
from public.profiles p
where p.id = c.id
  and p.city is not null
  and c.ciudad is null;

-- 2. Tabla consultor (capa de negocio, integer PK)
--    Agrega ciudad; los datos históricos se actualizan cruzando con profiles via email
alter table public.consultor
  add column if not exists ciudad text;

update public.consultor co
set ciudad = p.city
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = lower(co.email)
  and p.city is not null
  and co.ciudad is null;

commit;
