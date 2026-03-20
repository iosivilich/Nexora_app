-- Tabla maestra de perfiles (Bilateral)
create type user_role as enum ('EMPRESA', 'CONSULTOR');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  city text,
  user_type user_role not null,
  created_at timestamp with time zone default now()
);
