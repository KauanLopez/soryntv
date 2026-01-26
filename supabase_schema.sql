-- Run this in your Supabase SQL Editor

create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  onboarding_completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.user_genres (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  media_type text not null, -- 'movie', 'series', 'music'
  genre text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.user_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  media_type text not null, -- 'movie', 'series', 'music'
  title text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Secure the tables
alter table public.profiles enable row level security;
alter table public.user_genres enable row level security;
alter table public.user_favorites enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

drop policy if exists "Users can view own genres" on public.user_genres;
drop policy if exists "Users can insert own genres" on public.user_genres;

drop policy if exists "Users can view own favorites" on public.user_favorites;
drop policy if exists "Users can insert own favorites" on public.user_favorites;

-- Create policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view own genres" on public.user_genres for select using (auth.uid() = user_id);
create policy "Users can insert own genres" on public.user_genres for insert with check (auth.uid() = user_id);

create policy "Users can view own favorites" on public.user_favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on public.user_favorites for insert with check (auth.uid() = user_id);

-- Create a trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Addons table
create table if not exists public.user_addons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  transport_url text not null, -- The exact, full URL (contains sensitive config)
  manifest_url text, -- The normalized URL (optional)
  addon_id text not null, -- ID from manifest (e.g. com.stremio.torrentio)
  name text,
  logo text,
  version text,
  installed_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Prevent duplicate installation of the EXACT same configuration
  unique(user_id, transport_url)
);

-- Secure the table
alter table public.user_addons enable row level security;

-- Drop existing policies if they exist (for idempotency)
drop policy if exists "Users can view own addons" on public.user_addons;
drop policy if exists "Users can insert own addons" on public.user_addons;
drop policy if exists "Users can update own addons" on public.user_addons;
drop policy if exists "Users can delete own addons" on public.user_addons;

-- create policies
create policy "Users can view own addons" on public.user_addons for select using (auth.uid() = user_id);
create policy "Users can insert own addons" on public.user_addons for insert with check (auth.uid() = user_id);
create policy "Users can update own addons" on public.user_addons for update using (auth.uid() = user_id);
create policy "Users can delete own addons" on public.user_addons for delete using (auth.uid() = user_id);

-- Create index for performance
create index if not exists user_addons_user_id_idx on public.user_addons(user_id);

