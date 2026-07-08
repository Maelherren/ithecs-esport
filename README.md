# ITHECS — Site de la team e-sport

Site complet (Next.js 14 App Router + Tailwind + Supabase) pour la team **ITHECS** :
calendriers Matcherino & Scrim, disponibilités, résultats, actualités et informations.

- **Framework** : Next.js 14 (App Router, Server Actions)
- **Style** : Tailwind CSS — thème sombre, dominante bleu foncé
- **Données & stockage** : Supabase (Postgres + Storage)
- **Auth** : comptes en dur, mots de passe hashés bcrypt, session JWT en cookie httpOnly
- **Déploiement** : Vercel

---

## 1. Prérequis

- Node.js 18.18+ (testé sur Node 20/24)
- Un projet [Supabase](https://supabase.com) (gratuit)

## 2. Installation

```bash
npm install
cp .env.local.example .env.local   # (Windows : copy .env.local.example .env.local)
```

## 3. Configuration Supabase

### a) Créer le projet et récupérer les clés
Dans le dashboard Supabase → **Project Settings → API**, copie :
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY` *(secret, jamais côté client)*

### b) Générer le secret de session
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Colle la valeur dans `AUTH_SECRET`.

Ton `.env.local` doit ressembler à :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
AUTH_SECRET=<chaîne aléatoire longue>
```

### c) Créer les tables + RLS + bucket Storage
Dans Supabase → **SQL Editor → New query**, colle et exécute le contenu de
[`supabase/schema.sql`](supabase/schema.sql).

Cela crée toutes les tables, active **Row Level Security** (lecture publique,
écriture réservée aux Server Actions via la clé service_role), et crée le
bucket public `media` pour les images (avatars, actualités, infos).

### d) Créer les utilisateurs et le roster
```bash
npm run seed
```
Ce script hache les mots de passe (bcrypt) et insère les 4 comptes + le roster.

| Username    | Rôle        |
|-------------|-------------|
| chatax      | super-admin |
| shurtugal   | admin       |
| etna        | admin       |
| orby        | admin       |

> Les usernames sont comparés en minuscules (insensible à la casse).
> Les mots de passe ne sont jamais stockés en clair (uniquement le hash bcrypt).

## 4. Lancer en local

```bash
npm run dev
```
→ http://localhost:3000

## 5. Déploiement sur Vercel

1. Pousse le repo sur GitHub.
2. Sur [Vercel](https://vercel.com), importe le projet.
3. Ajoute les 4 variables d'environnement (**Settings → Environment Variables**) :
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`.
4. Déploie. (Le seed se lance depuis ta machine, pas besoin sur Vercel.)

---

## Rôles & droits

| Action                                   | Visiteur | Admin | Chatax (super-admin) |
|------------------------------------------|:--------:|:-----:|:--------------------:|
| Lire toutes les pages                    | ✅       | ✅    | ✅                   |
| Indiquer sa présence (Matcherino/Scrim)  | ❌       | ✅    | ✅                   |
| Marquer sa disponibilité                 | ❌       | ✅    | ✅                   |
| Ajouter/modifier/supprimer événements    | ❌       | ❌    | ✅                   |
| Gérer résultats, actualités, infos       | ❌       | ❌    | ✅                   |
| Modifier les avatars du roster           | ❌       | ❌    | ✅                   |

## Sécurité

- **Mots de passe** : hashés bcrypt (coût 12), jamais en clair dans le code/DB/client.
- **Login** : Server Action `loginAction` ; le mot de passe ne transite que dans le
  corps POST chiffré HTTPS, jamais exposé au JS client.
- **Session** : JWT signé (`jose`, HS256) stocké dans un cookie **httpOnly**, `secure`
  en production, `sameSite=lax`.
- **Mutations** : toutes les écritures passent par des Server Actions qui vérifient le
  rôle côté serveur (`requireAdmin` / `requireSuperAdmin`) avant d'utiliser la clé
  service_role. La protection CSRF est assurée par les Server Actions Next.js.
- **RLS** : activé sur toutes les tables. `SELECT` public ; aucune policy d'écriture
  pour anon/authenticated. La table `users` n'a **aucune** policy → inaccessible via
  les clés publiques (les hash ne fuitent jamais).
- **Validation** : les entrées sont validées/normalisées côté serveur (dates, heures,
  entiers, tailles/formats d'images).

## Structure

```
src/
  app/                     # Pages (App Router)
    page.tsx               # Accueil
    calendrier-matcherino/
    calendrier-scrim/
    disponibilite/
    resultats/
    actualite/
    information/
    layout.tsx globals.css
  components/               # UI (navbar, formulaires, calendrier, cartes…)
  lib/
    auth.ts                # sessions JWT httpOnly
    data.ts                # lectures (clé anon)
    format.ts types.ts
    supabase/              # clients public (anon) & admin (service_role)
    actions/               # Server Actions (mutations vérifiées côté serveur)
supabase/schema.sql        # tables + RLS + bucket Storage
scripts/seed-users.mjs     # création des comptes + roster
```

## Remplacer le logo

Le logo par défaut est [`public/logo.svg`](public/logo.svg) (wordmark ITHECS,
fond transparent). Remplace ce fichier par le logo officiel fourni (SVG ou PNG
transparent). Si tu utilises un PNG, dépose-le en `public/logo.png` et mets à jour
la source dans `src/components/Logo.tsx`.
