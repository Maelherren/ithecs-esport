import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Client Supabase "admin" (clé service_role).
// ⚠️ SERVEUR UNIQUEMENT. Import interdit côté client grâce à `server-only`.
// Cette clé contourne RLS : elle n'est utilisée que dans les Server Actions,
// APRÈS vérification du rôle de l'utilisateur.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY',
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
