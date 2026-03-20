-- Row Level Security (RLS) para todas las tablas

-- Habilitar RLS
alter table public.profiles enable row level security;
alter table public.consultants enable row level security;
alter table public.favorites enable row level security;
alter table public.messages enable row level security;

-- Políticas para Profiles
create policy "Public profiles are viewable by everyone" 
on public.profiles for select using (true);

create policy "Users can update own profile" 
on public.profiles for update using (auth.uid() = id);

-- Políticas para Consultants
create policy "Consultants are viewable by everyone" 
on public.consultants for select using (true);

-- Políticas para Favorites (Solo dueños gestionan sus favoritos)
create policy "Users can manage their own favorites" 
on public.favorites for all using (auth.uid() = user_id);

-- Políticas para Messages (Acceso restringido a participantes)
create policy "Users can see their own messages" 
on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages" 
on public.messages for insert with check (auth.uid() = sender_id);
