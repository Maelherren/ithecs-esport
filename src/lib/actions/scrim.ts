'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth';
import type { ScrimStatus } from '@/lib/types';
import { optionalStr, optionalTime, requireDate, str } from './helpers';

const PATHS = ['/', '/calendrier-scrim'];
function revalidate() {
  PATHS.forEach((p) => revalidatePath(p));
}

export async function createScrimEvent(formData: FormData) {
  await requireSuperAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from('scrim_events').insert({
    date: requireDate(formData.get('date')),
    time: optionalTime(formData.get('time')),
    opponent: optionalStr(formData.get('opponent'), 200),
    notes: optionalStr(formData.get('notes'), 2000),
  });
  if (error) throw new Error(error.message);
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
