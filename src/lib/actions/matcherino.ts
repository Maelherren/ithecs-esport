'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth';
import type { MatcherinoStatus } from '@/lib/types';
import {
  intOr,
  optionalInt,
  optionalStr,
  optionalTime,
  requireDate,
  str,
} from './helpers';

const PATHS = ['/', '/calendrier-matcherino'];
function revalidate() {
  PATHS.forEach((p) => revalidatePath(p));
}

export async function createMatcherinoEvent(formData: FormData) {
  await requireSuperAdmin();
  const name = str(formData.get('name'), 200);
  if (!name) throw new Error('Le nom du tournoi est requis.');

  const supabase = createAdminClient();
  const { error } = await supabase.from('matcherino_events').insert({
    name,
    date: requireDate(formData.get('date')),
    match_time: optionalTime(formData.get('match_time')),
    rdv_time: optionalTime(formData.get('rdv_time')),
    checkin_time: optionalTime(formData.get('checkin_time')),
    queue_position: optionalInt(formData.get('queue_position')),
    queue_max: optionalInt(formData.get('queue_max')),
    matcherino_link: optionalStr(formData.get('matcherino_link'), 500),
  });
  if (error) throw new Error(error.message);
  revalidate();
}

export async function updateMatcherinoEvent(formData: FormData) {
  await requireSuperAdmin();
  const id = str(formData.get('id'), 40);
  const name = str(formData.get('name'), 200);
  if (!id || !name) throw new Error('Données invalides.');

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('matcherino_events')
    .update({
      name,
      date: requireDate(formData.get('date')),
      match_time: optionalTime(formData.get('match_time')),
      rdv_time: optionalTime(formData.get('rdv_time')),
      checkin_time: optionalTime(formData.get('checkin_time')),
      queue_position: optionalInt(formData.get('queue_position')),
      queue_max: optionalInt(formData.get('queue_max')),
      matcherino_link: optionalStr(formData.get('matcherino_link'), 500),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidate();
}

export async function deleteMatcherinoEvent(formData: FormData) {
  await requireSuperAdmin();
  const id = str(formData.get('id'), 40);
  if (!id) throw new Error('Identifiant manquant.');

  const supabase = createAdminClient();
  const { error } = await supabase.from('matcherino_events').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidate();
}

// Un admin ne peut modifier QUE son propre statut (username issu de la session).
export async function setMatcherinoResponse(formData: FormData) {
  const session = await requireAdmin();
  const eventId = str(formData.get('event_id'), 40);
  const status = str(formData.get('status'), 12) as MatcherinoStatus;
  if (!eventId) throw new Error('Événement manquant.');
  if (!['present', 'absent', 'uncertain'].includes(status)) {
    throw new Error('Statut invalide.');
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('matcherino_responses').upsert(
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
