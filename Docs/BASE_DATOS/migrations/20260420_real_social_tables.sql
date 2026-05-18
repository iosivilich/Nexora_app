begin;

alter table public.profiles
  add column if not exists empresa_id integer references public.empresa(id_empresa),
  add column if not exists consultor_id integer references public.consultor(id_consultor);

update public.profiles p
set empresa_id = e.id_empresa
from auth.users u
join public.empresa e on lower(e.email_contacto) = lower(u.email)
where p.id = u.id
  and p.user_type = 'EMPRESA'
  and p.empresa_id is null;

update public.profiles p
set consultor_id = c.id_consultor
from auth.users u 
join public.consultor c on lower(c.email) = lower(u.email)
where p.id = u.id
  and p.user_type = 'CONSULTOR'
  and p.consultor_id is null;

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  notifications_email boolean not null default true,
  notifications_push boolean not null default true,
  notifications_projects boolean not null default true,
  language text not null default 'es',
  timezone text not null default 'America/Bogota',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  consultant_profile_id uuid not null references public.consultants(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, consultant_profile_id)
);

create table if not exists public.connections (
  user_id uuid not null references public.profiles(id) on delete cascade,
  consultant_profile_id uuid not null references public.consultants(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, consultant_profile_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  company_user_id uuid not null references public.profiles(id) on delete cascade,
  consultant_user_id uuid not null references public.consultants(id) on delete cascade,
  challenge_id integer null references public.desafio(id_desafio) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  last_message_at timestamptz null default timezone('utc', now())
);

create unique index if not exists conversations_unique_pair_idx
  on public.conversations (company_user_id, consultant_user_id, coalesce(challenge_id, -1));

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  read_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists direct_messages_dedupe_idx
  on public.direct_messages (conversation_id, sender_id, created_at, content);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  consultant_profile_id uuid not null references public.consultants(id) on delete cascade,
  requested_at timestamptz not null,
  note text null default '',
  status text not null default 'pendiente',
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists appointments_dedupe_idx
  on public.appointments (requester_id, consultant_profile_id, requested_at, coalesce(note, ''));

alter table public.user_settings enable row level security;
alter table public.favorites enable row level security;
alter table public.connections enable row level security;
alter table public.conversations enable row level security;
alter table public.direct_messages enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "user_settings_upsert_own" on public.user_settings;
create policy "user_settings_upsert_own"
  on public.user_settings for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "connections_select_own" on public.connections;
create policy "connections_select_own"
  on public.connections for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "connections_insert_own" on public.connections;
create policy "connections_insert_own"
  on public.connections for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "connections_delete_own" on public.connections;
create policy "connections_delete_own"
  on public.connections for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant"
  on public.conversations for select
  to authenticated
  using (auth.uid() = company_user_id or auth.uid() = consultant_user_id);

drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant"
  on public.conversations for insert
  to authenticated
  with check (auth.uid() = company_user_id or auth.uid() = consultant_user_id);

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant"
  on public.conversations for update
  to authenticated
  using (auth.uid() = company_user_id or auth.uid() = consultant_user_id)
  with check (auth.uid() = company_user_id or auth.uid() = consultant_user_id);

drop policy if exists "direct_messages_select_participant" on public.direct_messages;
create policy "direct_messages_select_participant"
  on public.direct_messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.company_user_id or auth.uid() = c.consultant_user_id)
    )
  );

drop policy if exists "direct_messages_insert_participant" on public.direct_messages;
create policy "direct_messages_insert_participant"
  on public.direct_messages for insert
  to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (auth.uid() = c.company_user_id or auth.uid() = c.consultant_user_id)
    )
  );

drop policy if exists "appointments_select_participant" on public.appointments;
create policy "appointments_select_participant"
  on public.appointments for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = consultant_profile_id);

drop policy if exists "appointments_insert_requester" on public.appointments;
create policy "appointments_insert_requester"
  on public.appointments for insert
  to authenticated
  with check (auth.uid() = requester_id);

drop policy if exists "appointments_update_participant" on public.appointments;
create policy "appointments_update_participant"
  on public.appointments for update
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = consultant_profile_id)
  with check (auth.uid() = requester_id or auth.uid() = consultant_profile_id);

insert into public.user_settings (
  user_id,
  notifications_email,
  notifications_push,
  notifications_projects,
  language,
  timezone,
  updated_at
)
select
  u.id,
  coalesce((u.raw_user_meta_data -> 'settings' -> 'notifications' ->> 'email')::boolean, true),
  coalesce((u.raw_user_meta_data -> 'settings' -> 'notifications' ->> 'push')::boolean, true),
  coalesce((u.raw_user_meta_data -> 'settings' -> 'notifications' ->> 'projects')::boolean, true),
  coalesce(u.raw_user_meta_data -> 'settings' ->> 'language', 'es'),
  coalesce(u.raw_user_meta_data -> 'settings' ->> 'timezone', 'America/Bogota'),
  timezone('utc', now())
from auth.users u
join public.profiles p on p.id = u.id
on conflict (user_id) do update
set notifications_email = excluded.notifications_email,
    notifications_push = excluded.notifications_push,
    notifications_projects = excluded.notifications_projects,
    language = excluded.language,
    timezone = excluded.timezone,
    updated_at = excluded.updated_at;

insert into public.connections (user_id, consultant_profile_id, created_at)
select
  u.id,
  c.id,
  timezone('utc', now())
from auth.users u
cross join lateral jsonb_array_elements_text(coalesce(u.raw_user_meta_data -> 'networkConnections', '[]'::jsonb)) as connection_id(value)
join public.consultants c on c.id::text = connection_id.value
on conflict do nothing;

insert into public.favorites (user_id, consultant_profile_id, created_at)
select
  u.id,
  c.id,
  timezone('utc', now())
from auth.users u
cross join lateral jsonb_array_elements_text(coalesce(u.raw_user_meta_data -> 'favoriteConsultants', '[]'::jsonb)) as favorite_id(value)
join public.consultants c on c.id::text = favorite_id.value
on conflict do nothing;

insert into public.appointments (
  requester_id,
  consultant_profile_id,
  requested_at,
  note,
  status,
  created_at
)
select
  u.id,
  c.id,
  coalesce((appointment ->> 'requestedAt')::timestamptz, timezone('utc', now())),
  coalesce(appointment ->> 'note', ''),
  coalesce(appointment ->> 'status', 'pendiente'),
  coalesce((appointment ->> 'createdAt')::timestamptz, timezone('utc', now()))
from auth.users u
cross join lateral jsonb_array_elements(coalesce(u.raw_user_meta_data -> 'appointments', '[]'::jsonb)) as appointment
join public.consultants c on c.id::text = appointment ->> 'consultantId'
on conflict do nothing;

with source_conversations as (
  select
    u.id as company_user_id,
    c.id as consultant_user_id,
    min(coalesce((message ->> 'createdAt')::timestamptz, timezone('utc', now()))) as created_at,
    max(coalesce((message ->> 'createdAt')::timestamptz, timezone('utc', now()))) as last_message_at
  from auth.users u
  join public.profiles p on p.id = u.id and p.user_type = 'EMPRESA'
  cross join lateral jsonb_each(coalesce(u.raw_user_meta_data -> 'messageThreads', '{}'::jsonb)) as thread_entry(key, value)
  join public.consultants c on c.id::text = thread_entry.key
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(thread_entry.value) = 'array' then thread_entry.value
      else '[]'::jsonb
    end
  ) as message
  group by u.id, c.id
)
insert into public.conversations (
  company_user_id,
  consultant_user_id,
  challenge_id,
  created_at,
  last_message_at
)
select
  company_user_id,
  consultant_user_id,
  null,
  created_at,
  last_message_at
from source_conversations
on conflict do nothing;

with source_messages as (
  select
    conversation.id as conversation_id,
    u.id as company_user_id,
    c.id as consultant_user_id,
    message
  from auth.users u
  join public.profiles p on p.id = u.id and p.user_type = 'EMPRESA'
  cross join lateral jsonb_each(coalesce(u.raw_user_meta_data -> 'messageThreads', '{}'::jsonb)) as thread_entry(key, value)
  join public.consultants c on c.id::text = thread_entry.key
  join public.conversations conversation
    on conversation.company_user_id = u.id
   and conversation.consultant_user_id = c.id
   and conversation.challenge_id is null
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(thread_entry.value) = 'array' then thread_entry.value
      else '[]'::jsonb
    end
  ) as message
)
insert into public.direct_messages (
  conversation_id,
  sender_id,
  content,
  read_at,
  created_at
)
select
  conversation_id,
  case
    when coalesce((message ->> 'isOwn')::boolean, false) then company_user_id
    else consultant_user_id
  end as sender_id,
  coalesce(message ->> 'text', ''),
  case
    when coalesce((message ->> 'isOwn')::boolean, false) then timezone('utc', now())
    else null
  end,
  coalesce((message ->> 'createdAt')::timestamptz, timezone('utc', now()))
from source_messages
where coalesce(message ->> 'text', '') <> ''
on conflict do nothing;

commit;
