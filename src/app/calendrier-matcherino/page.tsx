import { Suspense } from 'react';
import MatcherinoForm from '@/components/MatcherinoForm';
import PresenceControls from '@/components/PresenceControls';
import DeleteButton from '@/components/DeleteButton';
import Countdown from '@/components/Countdown';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { getSession } from '@/lib/auth';
import { getMatcherinoEvents, getMatcherinoResponses } from '@/lib/data';
import { deleteMatcherinoEvent, setMatcherinoResponse } from '@/lib/actions/matcherino';
import { formatDateFR, formatTime, isUpcoming, toISODateTime } from '@/lib/format';
import type { SessionUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function MatcherinoPage() {
  const session = await getSession();
  const isSuper = session?.role === 'super-admin';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title heading-accent">Calendrier Matcherino</h1>
          <p className="mt-1 text-slate-400">
            Tournois à venir, horaires et présence des joueurs.
          </p>
        </div>
        {isSuper && <MatcherinoForm />}
      </div>

      <Suspense fallback={<SkeletonGrid count={4} />}>
        <MatcherinoList session={session} isSuper={isSuper} />
      </Suspense>
    </div>
  );
}

async function MatcherinoList({
  session,
  isSuper,
}: {
  session: SessionUser | null;
  isSuper: boolean;
}) {
  const [events, responses] = await Promise.all([
    getMatcherinoEvents(),
    getMatcherinoResponses(),
  ]);
  const byEvent = (id: string) => responses.filter((r) => r.event_id === id);

  return (
    <>
      {events.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          Aucun tournoi programmé pour le moment.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {events.map((e) => {
          const upcoming = isUpcoming(e.date, e.match_time);
          return (
            <article key={e.id} className="card animate-fade-in flex flex-col p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{e.name}</h2>
                  <p className="text-sm capitalize text-slate-400">
                    {formatDateFR(e.date)}
                  </p>
                  {e.matcherino_link && (
                    <a
                      href={e.matcherino_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs font-semibold text-accent hover:underline"
                    >
                      🔗 Lien Matcherino
                    </a>
                  )}
                </div>
                {upcoming && <Countdown target={toISODateTime(e.date, e.match_time)} />}
              </div>

              {/* Détails horaires */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { l: 'Match', v: formatTime(e.match_time) },
                  { l: 'RDV', v: formatTime(e.rdv_time) },
                  { l: 'Check-in', v: formatTime(e.checkin_time) },
                  {
                    l: 'File d’attente',
                    v:
                      e.queue_position && e.queue_max
                        ? `${e.queue_position}ᵉ / ${e.queue_max}`
                        : e.queue_position
                          ? `${e.queue_position}ᵉ`
                          : '—',
                  },
                ].map((item) => (
                  <div
                    key={item.l}
                    className="rounded-md border border-steel/50 bg-night/50 px-3 py-2"
                  >
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      {item.l}
                    </p>
                    <p className="font-semibold text-slate-100">{item.v || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Présence des admins */}
              <div className="mt-5">
                <p className="label">Présence de l’équipe</p>
                <PresenceControls
                  eventId={e.id}
                  variant="matcherino"
                  responses={byEvent(e.id)}
                  currentUser={session}
                  action={setMatcherinoResponse}
                />
              </div>

              {isSuper && (
                <div className="mt-5 flex items-center gap-3 border-t border-steel/40 pt-4">
                  <MatcherinoForm event={e} trigger="link" />
                  <DeleteButton id={e.id} action={deleteMatcherinoEvent} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
