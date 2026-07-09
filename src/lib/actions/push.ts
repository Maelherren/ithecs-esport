'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth';

type SubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

// Enregistre (ou met à jour) l'abonnement push de l'admin connecté.
export async function subscribePush(sub: SubscriptionInput): Promise<void> {
  const session = await requireAdmin();
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    throw new Error('Abonnement push invalide.');
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      endpoint: sub.endpoint,
      keys_p256dh: sub.keys.p256dh,
      keys_auth: sub.keys.auth,
      username: session.username,
    },
    { onConflict: 'endpoint' },
  );
  if (error) throw new Error(error.message);
}

// Supprime un abonnement (désactivation des notifications).
export async function unsubscribePush(endpoint: string): Promise<void> {
  await requireAdmin();
  if (!endpoint) return;
  const supabase = createAdminClient();
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
}
