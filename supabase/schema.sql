-- =====================================================================
--  ITHECS — Schéma de base de données Supabase
--  À exécuter dans : Supabase Dashboard > SQL Editor > New query
-- =====================================================================
--  Sécurité :
--   - RLS activé sur TOUTES les tables.
--   - SELECT  : public (lecture par tous les visiteurs).
--   - INSERT/UPDATE/DELETE : AUCUNE policy pour anon/authenticated.
--     => Seules les Server Actions Next.js utilisant la clé service_role
--        (qui contourne RLS) peuvent écrire, après vérification du rôle.
-- =====================================================================

-- Extensions utiles (uuid)
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
--  UTILISATEURS
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  password_hash text not null,
  role          text not null check (role in ('super-admin', 'admin')),
  created_at    timestamptz not null default now()
);
-- Recherche insensible à la casse sur le username
create unique index if not exists users_username_lower_idx
  on public.users (lower(username));

-- ---------------------------------------------------------------------
--  ROSTER (membres affichés sur l'accueil)
-- ---------------------------------------------------------------------
create table if not exists public.roster (
  id           uuid primary key default gen_random_uuid(),
  username     text not null unique,
  display_name text not null,
  role_label   text not null default 'Member',   -- 'Captain' | 'Member'
  avatar_url   text,
  sort_order   int  not null default 0,
  updated_at   timestamptz not null default now(),
  -- Profil détaillé, rempli par chaque admin (thème Brawl Stars)
  trophies     int,
  ranked_rank  text,
  fav_brawler  text,
  brawler_type text,
  fav_mode     text,
  emote_url    text,
  fav_food     text,
  fav_drink    text,
  fav_skin     text,
  quote        text
);
-- Colonnes de profil ajoutées si la table existait déjà.
alter table public.roster add column if not exists trophies     int;
alter table public.roster add column if not exists ranked_rank  text;
alter table public.roster add column if not exists fav_brawler  text;
alter table public.roster add column if not exists brawler_type text;
alter table public.roster add column if not exists fav_mode     text;
alter table public.roster add column if not exists emote_url    text;
alter table public.roster add column if not exists fav_food     text;
alter table public.roster add column if not exists fav_drink    text;
alter table public.roster add column if not exists fav_skin     text;
alter table public.roster add column if not exists quote        text;

-- ---------------------------------------------------------------------
--  CALENDRIER MATCHERINO
-- ---------------------------------------------------------------------
create table if not exists public.matcherino_events (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  date           date not null,
  match_time     time,
  rdv_time       time,
  checkin_time   time,
  queue_position int,
  queue_max      int,
  matcherino_link text,
  created_at     timestamptz not null default now()
);

create table if not exists public.matcherino_responses (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.matcherino_events(id) on delete cascade,
  username   text not null,
  status     text not null check (status in ('present', 'absent', 'uncertain')),
  updated_at timestamptz not null default now(),
  unique (event_id, username)
);

-- ---------------------------------------------------------------------
--  CALENDRIER SCRIM
-- ---------------------------------------------------------------------
create table if not exists public.scrim_events (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  time       time,
  opponent   text,
  notes      text,
  created_at timestamptz not null default now()
);

create table if not exists public.scrim_responses (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.scrim_events(id) on delete cascade,
  username   text not null,
  status     text not null check (status in ('present', 'absent')),
  updated_at timestamptz not null default now(),
  unique (event_id, username)
);

-- ---------------------------------------------------------------------
--  DISPONIBILITÉ
-- ---------------------------------------------------------------------
create table if not exists public.availability (
  id         uuid primary key default gen_random_uuid(),
  username   text not null,
  date       date not null,
  status     text not null check (status in ('available', 'unavailable')),
  updated_at timestamptz not null default now(),
  unique (username, date)
);

-- ---------------------------------------------------------------------
--  RÉSULTATS
-- ---------------------------------------------------------------------
create table if not exists public.results (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  date       date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.result_rounds (
  id           uuid primary key default gen_random_uuid(),
  result_id    uuid not null references public.results(id) on delete cascade,
  round_number int  not null,
  sets_won     int  not null default 0,
  sets_lost    int  not null default 0,
  rounds_won   int  not null default 0,
  rounds_lost  int  not null default 0,
  sets_to_win  int  not null default 1 check (sets_to_win in (1, 2, 3)),
  comment      text
);
-- Ajout de la colonne commentaire si la table existait déjà.
alter table public.result_rounds add column if not exists comment text;

-- ---------------------------------------------------------------------
--  ACTUALITÉ & INFORMATION
-- ---------------------------------------------------------------------
create table if not exists public.news (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  content    text not null default '',
  image_url  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.info (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  content    text not null default '',
  image_url  text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
--  ROW LEVEL SECURITY
-- =====================================================================
alter table public.users                enable row level security;
alter table public.roster               enable row level security;
alter table public.matcherino_events    enable row level security;
alter table public.matcherino_responses enable row level security;
alter table public.scrim_events         enable row level security;
alter table public.scrim_responses      enable row level security;
alter table public.availability         enable row level security;
alter table public.results              enable row level security;
alter table public.result_rounds        enable row level security;
alter table public.news                 enable row level security;
alter table public.info                 enable row level security;

-- --- Lecture publique (SELECT) sur les tables de contenu ---
-- NB : la table `users` n'a AUCUNE policy => totalement inaccessible
--      via les clés anon/authenticated (les hash ne fuitent jamais).
--      Elle n'est lue que côté serveur via la clé service_role.

do $$
declare t text;
begin
  foreach t in array array[
    'roster','matcherino_events','matcherino_responses',
    'scrim_events','scrim_responses','availability',
    'results','result_rounds','news','info'
  ]
  loop
    execute format(
      'drop policy if exists "public_read_%1$s" on public.%1$s;', t);
    execute format(
      'create policy "public_read_%1$s" on public.%1$s for select using (true);', t);
  end loop;
end $$;

-- Aucune policy INSERT/UPDATE/DELETE n'est créée volontairement :
-- toutes les mutations passent par la clé service_role (Server Actions),
-- qui contourne RLS après vérification du rôle côté serveur.

-- =====================================================================
--  STORAGE (avatars, actualités, informations)
--  Crée le bucket public "media" puis exécute les policies ci-dessous.
--  (Tu peux aussi créer le bucket via le Dashboard > Storage.)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');
-- Les uploads passent par la Server Action (service_role) uniquement.
