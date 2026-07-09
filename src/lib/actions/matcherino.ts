'use server';

import { revalidatePath } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { sendPushToAll } from '@/lib/push';
import {
  ADMIN_USERNAMES,
  displayName,
  type MatcherinoEvent,
  type MatcherinoStatus,
} from '@/lib/types';
import { formatDateFR, formatDateShort, formatTime } from '@/lib/format';
import {
  intOr,
  optionalInt,
  optionalStr,
  optionalTime,
  requireDate,
  str,
} from './helpers';

const PRESENCE_THRESHOLD = 3;

const PATHS = ['/', '/calendrier-matcherino'];
function revalidate() {
  PATHS.forEach((p) => revalidatePath(p));
}

export async function createMatcherinoEvent(formData: FormData) {
  await requireSuperAdmin();
  const name = str(formData.get('name'), 200);
  if (!name) throw new Error('Le nom du tournoi est requis.');

  const date = requireDate(formData.get('date'));
  const matchTime = optionalTime(formData.get('match_time'));

  const supabase = createAdminClient();
  const { error } = await supabase.from('matcherino_events').insert({
    name,
    date,
    match_time: matchTime,
    rdv_time: optionalTime(formData.get('rdv_time')),
    checkin_time: optionalTime(formData.get('checkin_time')),
    queue_position: optionalInt(formData.get('queue_position')),
    queue_max: optionalInt(formData.get('queue_max')),
    matcherino_link: optionalStr(formData.get('matcherino_link'), 500),
  });
  if (error) throw new Error(error.message);

  // Notification push à tous les abonnés (échec silencieux, non bloquant).
  const heure = formatTime(matchTime);
  await sendPushToAll({
    title: '🏆 Nouveau tournoi Matcherino',
    body: `${name} — ${formatDateShort(date)}${heure ? ` à ${heure}` : ''}`,
    url: '/calendrier-matcherino',
    tag: 'matcherino-event',
  }).catch((e) => console.error('[push] Matcherino:', e));

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

  // Envoi email automatique quand on atteint le seuil de présents.
  if (status === 'present') {
    await maybeNotifyThreshold(supabase, eventId);
  }

  revalidate();
}

type ResponseRow = { username: string; status: MatcherinoStatus };

// Envoie une seule fois l'email « 3 présents » pour un événement.
// Le drapeau email_sent est basculé de façon atomique (compare-and-set) pour
// éviter tout doublon même en cas de clics simultanés.
async function maybeNotifyThreshold(
  supabase: SupabaseClient,
  eventId: string,
): Promise<void> {
  const { data: responses } = await supabase
    .from('matcherino_responses')
    .select('username, status')
    .eq('event_id', eventId);

  const rows = (responses ?? []) as ResponseRow[];
  const presentCount = rows.filter((r) => r.status === 'present').length;
  if (presentCount < PRESENCE_THRESHOLD) return;

  // Claim atomique : false -> true. On ne récupère l'événement que si on a
  // « gagné la course », c.-à-d. si l'email n'avait pas encore été envoyé.
  const { data: claimed } = await supabase
    .from('matcherino_events')
    .update({ email_sent: true })
    .eq('id', eventId)
    .eq('email_sent', false)
    .select('*')
    .maybeSingle();

  if (!claimed) return; // déjà envoyé précédemment.

  try {
    await sendPresenceEmail(claimed as MatcherinoEvent, rows);
  } catch (e) {
    // Échec d'envoi : on remet le drapeau à false pour permettre un nouvel essai.
    await supabase
      .from('matcherino_events')
      .update({ email_sent: false })
      .eq('id', eventId);
    console.error('[matcherino] Échec de l’envoi de l’email de présence :', e);
  }
}

function statusLabel(status: MatcherinoStatus | undefined): string {
  switch (status) {
    case 'present':
      return '✅ Présent';
    case 'absent':
      return '❌ Absent';
    case 'uncertain':
      return '❓ Incertain';
    default:
      return '❓ Sans réponse';
  }
}

async function sendPresenceEmail(
  event: MatcherinoEvent,
  responses: ResponseRow[],
): Promise<void> {
  const byUser = new Map(responses.map((r) => [r.username.toLowerCase(), r.status]));

  const memberRows = ADMIN_USERNAMES.map((u) => {
    const label = statusLabel(byUser.get(u));
    return `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #1a2d5a;color:#e2e8f0;">${displayName(u)}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #1a2d5a;color:#e2e8f0;">${label}</td>
    </tr>`;
  }).join('');

  const info = (label: string, value: string | null | undefined) =>
    value
      ? `<tr>
          <td style="padding:4px 12px;color:#94a3b8;">${label}</td>
          <td style="padding:4px 12px;color:#e2e8f0;font-weight:600;">${value}</td>
        </tr>`
      : '';

  const link = event.matcherino_link
    ? `<a href="${event.matcherino_link}" style="color:#3b82f6;">${event.matcherino_link}</a>`
    : null;

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:24px;background:#0a0f1e;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#0d152b;border:1px solid #1a2d5a;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#1e3a8a,#0d152b);padding:20px 24px;">
        <h1 style="margin:0;color:#ffffff;font-size:18px;">ITHECS — 3 présents confirmés ✅</h1>
        <p style="margin:6px 0 0;color:#93c5fd;font-size:14px;">${event.name}</p>
      </div>
      <div style="padding:20px 24px;">
        <h2 style="margin:0 0 8px;color:#e2e8f0;font-size:15px;">📅 Détails de l'événement</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${info('Événement', event.name)}
          ${info('Date', formatDateFR(event.date))}
          ${info('Heure du match', formatTime(event.match_time))}
          ${info('Heure de RDV', formatTime(event.rdv_time))}
          ${info('Heure de check-in', formatTime(event.checkin_time))}
          ${info('Lien Matcherino', link)}
        </table>

        <h2 style="margin:20px 0 8px;color:#e2e8f0;font-size:15px;">👥 Présences</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${memberRows}
        </table>
      </div>
      <div style="padding:14px 24px;background:#0a0f1e;color:#64748b;font-size:12px;">
        Email automatique — envoyé une seule fois dès que 3 membres sont présents.
      </div>
    </div>
  </body>
</html>`;

  await sendEmail({
    subject: `ITHECS — 3 présents confirmés : ${event.name}`,
    html,
  });
}
