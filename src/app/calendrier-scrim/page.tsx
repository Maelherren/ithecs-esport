import ScrimForm from '@/components/ScrimForm';
import PresenceControls from '@/components/PresenceControls';
import DeleteButton from '@/components/DeleteButton';
import Countdown from '@/components/Countdown';
import { getSession } from '@/lib/auth';
import { getScrimEvents, getScrimResponses } from '@/lib/data';
import { deleteScrimEvent, setScrimResponse } from '@/lib/actions/scrim';
import { formatDateFR, formatTime, isUpcoming, toISODateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ScrimPage() {
  const [events, responses, session] = await Promise.all([
    getScrimEvents(),
    getScrimResponses(),
    getSession(),
  ]);

  const isSuper = session?.role === 'super-admin';
  const byEvent = (id: string) => responses.filter((r) => r.event_id === id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title heading-accent">Calendrier Scrim</h1>
          <p className="mt-1 text-slate-400">
            Matchs d’entraînement et présence de l’équipe.
          </p>
        </div>
        {isSuper && <ScrimForm />}
      </div>

      {events.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          Aucun scrim programmé pour le moment.
        </div>
      )}

      <div className="space-y-5">
        {events.map((e) => {
          const upcoming = isUpcoming(e.date, e.time);
          return (
            <article key={e.id} className="card animate-fade-in p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {e.opponent ? `vs ${e.opponent}` : 'Adversaire à déterminer'}
                  </h2>
                  <p className="text-sm capitalize text-slate-400">
                    {formatDateFR(e.date)}
                    {e.time ? ` · ${formatTime(e.time)}` : ''}
                  </p>
                  {e.notes && (
                    <p className="mt-2 rounded-md border border-steel/40 bg-night/50 px-3 py-2 text-sm text-slate-300">
                      {e.notes}
                    </p>
                  )}
                </div>
                {upcoming && (
                  <Countdown target={toISODateTime(e.date, e.time)} compact />
                )}
              </div>

              <div className="mt-5">
                <p className="label">Présence de l’équipe</p>
                <PresenceControls
                  eventId={e.id}
                  variant="scrim"
                  responses={byEvent(e.id)}
                  currentUser={session}
                  action={setScrimResponse}
                />
              </div>

              {isSuper && (
                <div className="mt-5 flex items-center gap-3 border-t border-steel/40 pt-4">
                  <ScrimForm event={e} trigger="link" />
                  <DeleteButton id={e.id} action={deleteScrimEvent} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
