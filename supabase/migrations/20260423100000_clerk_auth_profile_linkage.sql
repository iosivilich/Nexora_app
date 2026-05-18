begin;

alter table public.profiles
  add column if not exists auth_provider text not null default 'supabase',
  add column if not exists auth_subject text,
  add column if not exists primary_email text;

update public.profiles p
set auth_provider = coalesce(p.auth_provider, 'supabase'),
    auth_subject = coalesce(p.auth_subject, u.id::text),
    primary_email = coalesce(p.primary_email, lower(u.email))
from auth.users u
where p.id = u.id;

create unique index if not exists profiles_auth_subject_unique_idx
  on public.profiles (auth_subject)
  where auth_subject is not null;

create index if not exists profiles_primary_email_lower_idx
  on public.profiles (lower(primary_email))
  where primary_email is not null;

create or replace function public.current_auth_subject()
returns text
language sql
stable
as $$
  select nullif(
    coalesce(
      auth.jwt() ->> 'sub',
      auth.jwt() ->> 'user_id'
    ),
    ''
  );
$$;

create or replace function public.current_auth_email()
returns text
language sql
stable
as $$
  select nullif(lower(auth.jwt() ->> 'email'), '');
$$;

create or replace function public.current_profile_id()
returns uuid
language plpgsql
stable
as $$
declare
  legacy_uid uuid;
  auth_subject text;
  auth_email text;
  resolved uuid;
begin
  legacy_uid := auth.uid();

  if legacy_uid is not null then
    select p.id
      into resolved
    from public.profiles p
    where p.id = legacy_uid
    limit 1;

    if resolved is not null then
      return resolved;
    end if;
  end if;

  auth_subject := public.current_auth_subject();

  if auth_subject is not null then
    select p.id
      into resolved
    from public.profiles p
    where p.auth_subject = auth_subject
    limit 1;

    if resolved is not null then
      return resolved;
    end if;
  end if;

  auth_email := public.current_auth_email();

  if auth_email is not null then
    select p.id
      into resolved
    from public.profiles p
    where lower(p.primary_email) = auth_email
    order by p.updated_at desc nulls last
    limit 1;

    if resolved is not null then
      return resolved;
    end if;
  end if;

  return null;
end;
$$;

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (
    (
      auth.uid() is not null
      and id = auth.uid()
    )
    or (
      public.current_auth_subject() is not null
      and auth_subject = public.current_auth_subject()
    )
  );

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (public.current_profile_id() = id)
  with check (public.current_profile_id() = id);

drop policy if exists "Consultants can update their own data" on public.consultants;
create policy "Consultants can update their own data"
  on public.consultants for update
  to authenticated
  using (public.current_profile_id() = id)
  with check (public.current_profile_id() = id);

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings for select
  to authenticated
  using (public.current_profile_id() = user_id);

drop policy if exists "user_settings_upsert_own" on public.user_settings;
create policy "user_settings_upsert_own"
  on public.user_settings for insert
  to authenticated
  with check (public.current_profile_id() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings for update
  to authenticated
  using (public.current_profile_id() = user_id)
  with check (public.current_profile_id() = user_id);

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
  on public.favorites for select
  to authenticated
  using (public.current_profile_id() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
  on public.favorites for insert
  to authenticated
  with check (public.current_profile_id() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
  on public.favorites for delete
  to authenticated
  using (public.current_profile_id() = user_id);

drop policy if exists "connections_select_own" on public.connections;
create policy "connections_select_own"
  on public.connections for select
  to authenticated
  using (public.current_profile_id() = user_id);

drop policy if exists "connections_insert_own" on public.connections;
create policy "connections_insert_own"
  on public.connections for insert
  to authenticated
  with check (public.current_profile_id() = user_id);

drop policy if exists "connections_delete_own" on public.connections;
create policy "connections_delete_own"
  on public.connections for delete
  to authenticated
  using (public.current_profile_id() = user_id);

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant"
  on public.conversations for select
  to authenticated
  using (public.current_profile_id() = company_user_id or public.current_profile_id() = consultant_user_id);

drop policy if exists "conversations_insert_participant" on public.conversations;
create policy "conversations_insert_participant"
  on public.conversations for insert
  to authenticated
  with check (public.current_profile_id() = company_user_id or public.current_profile_id() = consultant_user_id);

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant"
  on public.conversations for update
  to authenticated
  using (public.current_profile_id() = company_user_id or public.current_profile_id() = consultant_user_id)
  with check (public.current_profile_id() = company_user_id or public.current_profile_id() = consultant_user_id);

drop policy if exists "direct_messages_select_participant" on public.direct_messages;
create policy "direct_messages_select_participant"
  on public.direct_messages for select
  to authenticated
  using (
    exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (
          public.current_profile_id() = c.company_user_id
          or public.current_profile_id() = c.consultant_user_id
        )
    )
  );

drop policy if exists "direct_messages_insert_participant" on public.direct_messages;
create policy "direct_messages_insert_participant"
  on public.direct_messages for insert
  to authenticated
  with check (
    public.current_profile_id() = sender_id
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (
          public.current_profile_id() = c.company_user_id
          or public.current_profile_id() = c.consultant_user_id
        )
    )
  );

drop policy if exists "appointments_select_participant" on public.appointments;
create policy "appointments_select_participant"
  on public.appointments for select
  to authenticated
  using (public.current_profile_id() = requester_id or public.current_profile_id() = consultant_profile_id);

drop policy if exists "appointments_insert_requester" on public.appointments;
create policy "appointments_insert_requester"
  on public.appointments for insert
  to authenticated
  with check (public.current_profile_id() = requester_id);

drop policy if exists "appointments_update_participant" on public.appointments;
create policy "appointments_update_participant"
  on public.appointments for update
  to authenticated
  using (public.current_profile_id() = requester_id or public.current_profile_id() = consultant_profile_id)
  with check (public.current_profile_id() = requester_id or public.current_profile_id() = consultant_profile_id);

commit;
