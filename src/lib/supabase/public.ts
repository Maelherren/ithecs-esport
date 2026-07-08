import { createClient } from '@supabase/supabase-js';

// Client Supabase "public" (clé anon).
// Utilisé pour les LECTURES. Toutes les lectures sont autorisées par les
// policies RLS `public_read_*`. Aucune écriture n'est possible avec cette clé.
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
