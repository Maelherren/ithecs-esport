'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth';
import { sendPushToAll } from '@/lib/push';
import type { ScrimStatus } from '@/lib/types';
import { formatDateShort, formatTime } from '@/lib/format';
import { optionalStr, optionalTime, requireDate, str } from './helpers';

const PATHS = ['/', '/calendrier-scrim'];
function revalidate() {
  PATHS.forEach((p) => revalidatePath(p));
}

export async function createScrimEvent(formData: FormData) {
  await requireSuperAdmin();
  const date = requireDate(formData.get('date'));
  const time = optionalTime(formData.get('time'));
  const opponent = optionalStr(formData.get('opponent'), 200);

  const supabase = createAdminClient();
  const { error } = await supabase.from('scrim_events').insert({
    date,
    time,
    opponent,
    notes: optionalStr(formData.get('notes'), 2000),
  });
  if (error) throw new Error(error.message);

  // Notification push à tous les abonnés (échec silencieux, non bloquant).
  const heure = formatTime(time);
  await sendPushToAll({
    title: '⚔️ Nouveau scrim programmé',
    body: `${opponent ? `vs ${opponent} — ` : ''}${formatDateShort(date)}${heure ? ` à ${heure}` : ''}`,
    url: '/calendrier-scrim',
    tag: 'scrim-event',
  }).catch((e) => console.error('[push] Scrim:', e));

  revalidate();
}

export async function updateScrimEvent(formData: FormData) {
  await requireSuperAdmin();
  const id = str(formData.get('id'), 40);
  if (!id) throw new Error('Identifiant manquant.');

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('scrim_events')
    .update({
      date: requireDate(formData.get('date')),
      time: optionalTime(formData.get('time')),
      opponent: optionalStr(formData.get('opponent'), 200),
      notes: optionalStr(formData.get('notes'), 2000),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidate();
}

export async function deleteScrimEvent(formData: FormData) {
  await requireSuperAdmin();
  const id = str(formData.get('id'), 40);
  if (!id) throw new Error('Identifiant manquant.');

  const supabase = createAdminClient();
  const { error } = await supabase.from('scrim_events').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidate();
}

export async function setScrimResponse(formData: FormData) {
  const session = await requireAdmin();
  const eventId = str(formData.get('event_id'), 40);
  const status = str(formData.get('status'), 12) as ScrimStatus;
  if (!eventId) throw new Error('Événement manquant.');
  if (!['present', 'absent'].includes(status)) throw new Error('Statut invalide.');

  const supabase = createAdminClient();
  const { error } = await supabase.from('scrim_responses').upsert(
    {
      event_id: eventId,
      username: session.username,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'event_id,username' },
  );
  if (error) throw new Error(error.message);
  revalidate();
}
