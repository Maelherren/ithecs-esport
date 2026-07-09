import Link from 'next/link';
import Logo from '@/components/Logo';
import Countdown from '@/components/Countdown';
import RosterCard from '@/components/RosterCard';
import { getSession } from '@/lib/auth';
import {
  computeStats,
  getMatcherinoEvents,
  getResults,
  getRoster,
  getScrimEvents,
  isMatchWon,
} from '@/lib/data';
import { ADMIN_USERNAMES, displayName, type RosterMember } from '@/lib/types';
import { formatDateShort, formatTime, isUpcoming, toISODateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

// Fusionne matcherino + scrim en une liste d'événements à venir, triée.
function upcomingEvents(
  matcherino: Awaited<ReturnType<typeof getMatcherinoEvents>>,
  scrim: Awaited<ReturnType<typeof getScrimEvents>>,
) {
  const m = matcherino
    .filter((e) => isUpcoming(e.date, e.match_time))
    .map((e) => ({
      id: e.id,
      kind: 'Matcherino' as const,
      title: e.name,
      date: e.date,
      time: e.match_time,
      iso: toISODateTime(e.date, e.match_time),
    }));
  const s = scrim
    .filter((e) => isUpcoming(e.date, e.time))
    .map((e) => ({
      id: e.id,
      kind: 'Scrim' as const,
      title: e.opponent ? `vs ${e.opponent}` : 'Scrim',
      date: e.date,
      time: e.time,
      iso: toISODateTime(e.date, e.time),
    }));
  return [...m, ...s].sort(
    (a, b) => new Date(a.iso).getTime() - new Date(b.iso).getTime(),
  );
}

// Complète le roster avec les 4 membres par défaut si la table est vide/incomplète.
function normalizeRoster(roster: RosterMember[]): RosterMember[] {
  return ADMIN_USERNAMES.map((username, i) => {
    const found = roster.find((r) => r.username.toLowerCase() === username);
    return (
      found ?? {
        id: username,
        username,
        display_name: displayName(username),
        role_label: username === 'chatax' ? 'Captain' : 'Member',
        avatar_url: null,
        sort_order: i,
        updated_at: '',
        trophies: null,
        ranked_elo: null,
        fav_brawler: null,
        brawler_type: null,
        fav_mode: null,
        emote_url: null,
        fav_food: null,
        fav_drink: null,
        fav_skin: null,
        quote: null,
      }
    );
  });
}

export default async function HomePage() {
  const [matcherino, scrim, results, rosterRaw, session] = await Promise.all([
    getMatcherinoEvents(),
    getScrimEvents(),
    getResults(),
    getRoster(),
    getSession(),
  ]);

  const events = upcomingEvents(matcherino, scrim).slice(0, 3);
  const next = events[0];
  const roster = normalizeRoster(rosterRaw);
  const stats = computeStats(results);
  const latestResults = results.slice(0, 3);
  const isSuper = session?.role === 'super-admin';

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="animate-fade-in relative overflow-hidden rounded-2xl border border-steel/50 bg-abyss/40 px-6 py-16 text-center sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-grid-glow" />
        <div className="relative flex flex-col items-center">
          <Logo width={340} height={90} className="h-16 w-auto sm:h-24" />
          <h1 className="glow-text mt-6 text-4xl font-bold text-white sm:text-6xl">
            La team <span className="text-accent">ITHECS</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300">
            We play to win. — Calendriers, disponibilités, résultats et actualités
            de l’équipe, en un seul endroit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/calendrier-matcherino" className="btn-primary">
              Voir le calendrier
            </Link>
            <Link href="/resultats" className="btn-ghost">
              Nos résultats
            </Link>
          </div>
        </div>
      </section>

      {/* PROCHAINS ÉVÉNEMENTS */}
      <section className="animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="section-title heading-accent">Prochains événements</h2>
        </div>

        {next && (
          <div className="card mb-6 flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <span className="badge bg-primary/20 text-accent">{next.kind}</span>
              <p className="mt-2 text-xl font-bold text-white">{next.title}</p>
              <p className="text-sm text-slate-400">
                {formatDateShort(next.date)}
                {next.time ? ` · ${formatTime(next.time)}` : ''}
              </p>
            </div>
            <Countdown target={next.iso} />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {events.length === 0 && (
            <p className="col-span-full text-slate-400">
              Aucun événement à venir pour le moment.
            </p>
          )}
          {events.map((e) => (
            <div key={`${e.kind}-${e.id}`} className="card p-5">
              <span className="badge bg-primary/15 text-accent">{e.kind}</span>
              <p className="mt-2 font-bold text-white">{e.title}</p>
              <p className="text-sm text-slate-400">
                {formatDateShort(e.date)}
                {e.time ? ` · ${formatTime(e.time)}` : ''}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ROSTER */}
      <section className="animate-fade-in">
        <h2 className="section-title heading-accent mb-2">Roster</h2>
        <p className="mb-6 text-sm text-slate-400">
          Clique sur un membre pour voir son profil.
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {roster.map((m) => (
            <RosterCard
              key={m.username}
              member={m}
              canEdit={isSuper || session?.username?.toLowerCase() === m.username.toLowerCase()}
              isSuper={isSuper}
            />
          ))}
        </div>
      </section>

      {/* DERNIERS RÉSULTATS + STATS */}
      <section className="animate-fade-in">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title heading-accent">Derniers résultats</h2>
          <div className="flex gap-3">
            <div className="rounded-lg border border-steel/60 bg-abyss/60 px-4 py-2 text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs uppercase tracking-wider text-slate-400">Matchs</p>
            </div>
            <div className="rounded-lg border border-steel/60 bg-abyss/60 px-4 py-2 text-center">
              <p className="text-2xl font-bold text-accent">{stats.winRate}%</p>
              <p className="text-xs uppercase tracking-wider text-slate-400">Win rate</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {latestResults.length === 0 && (
            <p className="col-span-full text-slate-400">Aucun résultat enregistré.</p>
          )}
          {latestResults.map((r) => {
            const won = isMatchWon(r);
            return (
              <div key={r.id} className="card p-5">
                <p className="font-bold text-white">{r.name}</p>
                <p className="text-sm text-slate-400">{formatDateShort(r.date)}</p>
                <span
                  className={`badge mt-3 ${
                    won
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-red-500/15 text-red-300'
                  }`}
                >
                  {won ? '✅ Victoire' : '❌ Défaite'}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <Link href="/resultats" className="text-sm font-semibold text-accent hover:underline">
            Voir tous les résultats →
          </Link>
        </div>
      </section>
    </div>
  );
}
