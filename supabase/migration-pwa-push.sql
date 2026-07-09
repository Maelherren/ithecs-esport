-- ---------------------------------------------------------------------
--  Migration : email auto « 3 présents » + notifications push (PWA)
--  À exécuter dans Supabase → SQL Editor.
--  Idempotent : peut être relancé sans risque.
-- ---------------------------------------------------------------------

-- 1) Colonne pour l'email « 3 présents confirmés » (anti-doublon).
alter table public.matcherino_events
  add column if not exists email_sent boolean not null default false;

-- 2) Table des abonnements aux notifications push.
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  endpoint    text not null unique,
  keys_p256dh text not null,
  keys_auth   text not null,
  username    text,
  created_at  timestamptz not null default now()
);

-- RLS activé SANS policy : la table (endpoints sensibles) n'est accessible
-- que via la clé service_role côté serveur.
alter table public.push_subscriptions enable row level security;
