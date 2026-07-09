// =====================================================================
//  Seed ITHECS — crée les 4 utilisateurs (mots de passe hashés bcrypt)
//  et le roster par défaut dans Supabase.
//
//  Prérequis :
//   1. Avoir exécuté supabase/schema.sql dans le SQL Editor.
//   2. Avoir rempli .env.local (URL + SERVICE_ROLE_KEY).
//  Lancement : npm run seed
// =====================================================================

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Charge .env.local puis .env
config({ path: '.env.local' });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    '❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env.local',
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

// Comptes (usernames stockés en minuscules).
const USERS = [
  { username: 'chatax', password: 'eloMC16chaiseRUBCH', role: 'super-admin' },
  { username: 'shurtugal', password: 'eloMC16chaiseRUB', role: 'admin' },
  { username: 'etna', password: 'eloMC16chaiseRUB', role: 'admin' },
  { username: 'orby', password: 'eloMC16chaiseRUB', role: 'admin' },
];

const ROSTER = [
  { username: 'chatax', display_name: 'Chatax', role_label: 'Captain', sort_order: 0 },
  { username: 'shurtugal', display_name: "Shur'tugal", role_label: 'Member', sort_order: 1 },
  { username: 'etna', display_name: 'Etna', role_label: 'Member', sort_order: 2 },
  { username: 'orby', display_name: 'Orby', role_label: 'Member', sort_order: 3 },
];

async function main() {
  console.log('🔐 Hachage des mots de passe (bcrypt)…');
  const users = await Promise.all(
    USERS.map(async (u) => ({
      username: u.username.toLowerCase(),
      password_hash: await bcrypt.hash(u.password, 12),
      role: u.role,
    })),
  );

  console.log('👤 Upsert des utilisateurs…');
  const { error: userErr } = await supabase
    .from('users')
    .upsert(users, { onConflict: 'username' });
  if (userErr) throw userErr;

  console.log('🎮 Upsert du roster…');
  const { error: rosterErr } = await supabase
    .from('roster')
    .upsert(ROSTER, { onConflict: 'username' });
  if (rosterErr) throw rosterErr;

  console.log('✅ Seed terminé. 4 utilisateurs + roster créés.');
}

main().catch((e) => {
  console.error('❌ Erreur de seed :', e.message ?? e);
  process.exit(1);
});
