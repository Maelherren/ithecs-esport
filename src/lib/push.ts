import 'server-only';
import webpush from 'web-push';
import { createAdminClient } from '@/lib/supabase/admin';

let configured = false;

// Configure web-push avec les clés VAPID (une seule fois).
function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL;
  if (!publicKey || !privateKey || !email) {
    console.error('[push] Clés VAPID manquantes — notifications désactivées.');
    return false;
  }
  webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
  configured = true;
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

// Envoie une notification à tous les abonnés. Nettoie les abonnements morts (410/404).
export async function sendPushToAll(payload: PushPayload): Promise<void> {
  if (!ensureConfigured()) return;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('push_subscriptions')
    .select('endpoint, keys_p256dh, keys_auth');

  const subs = data ?? [];
  if (subs.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.keys_p256dh, auth: s.keys_auth },
          },
          body,
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        // Abonnement expiré/supprimé → on le retire de la base.
        if (status === 404 || status === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
        } else {
          console.error('[push] Envoi échoué:', status ?? err);
        }
      }
    }),
  );
}
