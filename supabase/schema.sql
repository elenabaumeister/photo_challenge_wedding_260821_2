-- Run this in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  task text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  image_url text not null,
  guest_name text,
  created_at timestamptz not null default now()
);

alter table public.challenges enable row level security;
alter table public.photos enable row level security;

create policy "Anyone can view active challenges"
on public.challenges for select
to anon
using (active = true);

create policy "Anyone can view photos"
on public.photos for select
to anon
using (true);

create policy "Anyone can submit photos"
on public.photos for insert
to anon
with check (
  exists (
    select 1 from public.challenges c
    where c.id = challenge_id and c.active = true
  )
);

-- Create a public bucket named wedding-photos.
insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', true)
on conflict (id) do update set public = true;

create policy "Guests can upload wedding photos"
on storage.objects for insert
to anon
with check (bucket_id = 'wedding-photos');

create policy "Anyone can view wedding photos"
on storage.objects for select
to anon
using (bucket_id = 'wedding-photos');
