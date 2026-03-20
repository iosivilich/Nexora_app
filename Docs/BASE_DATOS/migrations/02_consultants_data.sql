-- Tabla detallada de consultores
create table public.consultants (
  id uuid references public.profiles on delete cascade primary key,
  role text not null,
  rating decimal default 0,
  projects integer default 0,
  experience_years integer not null,
  age integer,
  bio text,
  expertise text[] default '{}',
  verified boolean default false,
  updated_at timestamp with time zone default now()
);
