-- Majada Properties — full schema, RLS, auth trigger, storage.
-- Run this once in the Supabase SQL editor (Dashboard -> SQL -> New query).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Clean slate. Safe to run repeatedly. Drops ONLY this app's objects; it does
-- not touch auth.users or existing Storage files. Run this whole file again
-- any time the schema gets into a half-built state.
-- ---------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.increment_property_views(uuid) cascade;
drop function if exists public.set_updated_at() cascade;

drop table if exists public.messages         cascade;
drop table if exists public.conversations    cascade;
drop table if exists public.saved_properties cascade;
drop table if exists public.property_images  cascade;
drop table if exists public.properties       cascade;
drop table if exists public.profiles         cascade;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, carries the buyer/seller role
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'buyer' check (role in ('buyer', 'seller')),
  full_name   text,
  phone       text,
  email       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------
create table if not exists public.properties (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.profiles (id) on delete cascade,
  title         text not null,
  description   text default '',
  property_type text not null default 'house'
                check (property_type in ('house', 'apartment', 'villa', 'land', 'commercial')),
  listing_type  text not null default 'sale' check (listing_type in ('sale', 'rent')),
  price         numeric not null default 0,
  currency      text not null default 'ZMW' check (currency in ('ZMW', 'USD')),
  city          text default '',
  location      text default '',
  bedrooms      integer not null default 0,
  bathrooms     integer not null default 0,
  area_sqm      numeric not null default 0,
  amenities     text[] not null default '{}',
  status        text not null default 'draft'
                check (status in ('draft', 'active', 'pending', 'sold')),
  views         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists properties_owner_idx  on public.properties (owner_id);
create index if not exists properties_status_idx on public.properties (status);

create table if not exists public.property_images (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  url         text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists property_images_property_idx on public.property_images (property_id);

-- ---------------------------------------------------------------------------
-- saved_properties (buyer shortlist)
-- ---------------------------------------------------------------------------
create table if not exists public.saved_properties (
  user_id     uuid not null references public.profiles (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- ---------------------------------------------------------------------------
-- conversations + messages (buyer <-> seller, per property)
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  buyer_id    uuid not null references public.profiles (id) on delete cascade,
  seller_id   uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (property_id, buyer_id)
);
create index if not exists conversations_buyer_idx  on public.conversations (buyer_id);
create index if not exists conversations_seller_idx on public.conversations (seller_id);

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  body            text not null check (length(trim(body)) > 0),
  created_at      timestamptz not null default now(),
  read_at         timestamptz
);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Create a profile automatically when a new auth user signs up.
-- Reads first_name / last_name / phone / user_type from signUp() metadata.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone, email)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'user_type', ''), 'buyer'),
    nullif(trim(concat_ws(' ',
      new.raw_user_meta_data ->> 'first_name',
      new.raw_user_meta_data ->> 'last_name')), ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- increment a property's view counter (bypasses RLS safely)
-- ---------------------------------------------------------------------------
create or replace function public.increment_property_views(pid uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.properties set views = views + 1 where id = pid;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.properties       enable row level security;
alter table public.property_images  enable row level security;
alter table public.saved_properties enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;

-- profiles: anyone can read (agent name/phone shown on listings); you edit only your own
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles insert" on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select using (true);
create policy "profiles insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- properties: public sees active listings; owner sees + manages all of their own
drop policy if exists "properties read"   on public.properties;
drop policy if exists "properties insert" on public.properties;
drop policy if exists "properties update" on public.properties;
drop policy if exists "properties delete" on public.properties;
create policy "properties read" on public.properties for select
  using (status = 'active' or owner_id = auth.uid());
create policy "properties insert" on public.properties for insert
  with check (owner_id = auth.uid());
create policy "properties update" on public.properties for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "properties delete" on public.properties for delete
  using (owner_id = auth.uid());

-- property_images: readable when the parent property is readable; writable by the owner
drop policy if exists "property_images read"  on public.property_images;
drop policy if exists "property_images write" on public.property_images;
create policy "property_images read" on public.property_images for select
  using (exists (
    select 1 from public.properties p
    where p.id = property_id and (p.status = 'active' or p.owner_id = auth.uid())
  ));
create policy "property_images write" on public.property_images for all
  using (exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()));

-- saved_properties: strictly your own
drop policy if exists "saved read"   on public.saved_properties;
drop policy if exists "saved write"  on public.saved_properties;
create policy "saved read"  on public.saved_properties for select using (user_id = auth.uid());
create policy "saved write" on public.saved_properties for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- conversations: only the two participants
drop policy if exists "conversations read"   on public.conversations;
drop policy if exists "conversations insert" on public.conversations;
create policy "conversations read" on public.conversations for select
  using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "conversations insert" on public.conversations for insert
  with check (buyer_id = auth.uid());

-- messages: readable by either participant; you can only send as yourself
drop policy if exists "messages read"   on public.messages;
drop policy if exists "messages insert" on public.messages;
drop policy if exists "messages update" on public.messages;
create policy "messages read" on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  ));
create policy "messages insert" on public.messages for insert
  with check (sender_id = auth.uid() and exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  ));
create policy "messages update" on public.messages for update
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- Storage bucket for property photos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists "property images public read" on storage.objects;
drop policy if exists "property images auth insert" on storage.objects;
drop policy if exists "property images owner update" on storage.objects;
drop policy if exists "property images owner delete" on storage.objects;
create policy "property images public read" on storage.objects for select
  using (bucket_id = 'property-images');
create policy "property images auth insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'property-images');
create policy "property images owner update" on storage.objects for update to authenticated
  using (bucket_id = 'property-images' and owner = auth.uid());
create policy "property images owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'property-images' and owner = auth.uid());

-- ---------------------------------------------------------------------------
-- Realtime: push new messages to the two conversation participants live.
-- (RLS still applies, so subscribers only receive their own rows.)
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
  when undefined_object then
    create publication supabase_realtime for table public.messages;
end $$;

alter table public.messages replica identity full;
