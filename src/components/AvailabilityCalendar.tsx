'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setAvailability } from '@/lib/actions/availability';
import {
  ADMIN_USERNAMES,
  displayName,
  type Availability,
  type SessionUser,
} from '@/lib/types';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Clé "YYY-MM-DD" locale sans décalage de fuseau.
function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function AvailabilityCalendar({
  data,
  currentUser,
}: {
  data: Availability[];
  currentUser: SessionUser | null;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const router = useRouter();

  const isAdmin =
    currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin');

  // Index: `${date}|${username}` -> status
  const index = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of data) map.set(`${a.date}|${a.username.toLowerCase()}`, a.status);
    return map;
  }, [data]);

  const firstDay = new Date(year, month, 1);
  // getDay(): 0=dim..6=sam -> on veut lundi en tête
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prev() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  function cycle(date: string) {
    if (!isAdmin || !currentUser) return;
    const key = `${date}|${currentUser.username.toLowerCase()}`;
    const cur = index.get(key);
    const nextStatus =
      cur === undefined ? 'available' : cur === 'available' ? 'unavailable' : 'clear';
    const fd = new FormData();
    fd.set('date', date);
    fd.set('status', nextStatus);
    setBusyKey(date);
    startTransition(async () => {
      await setAvailability(fd);
      router.refresh();
      setBusyKey(null);
    });
  }

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="card p-4 sm:p-6">
      {/* En-tête navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button className="btn-ghost px-3" onClick={prev} aria-label="Mois précédent">
          ←
        </button>
        <h2 className="text-lg font-bold text-white sm:text-xl">
          {MONTHS[month]} {year}
        </h2>
        <button className="btn-ghost px-3" onClick={next} aria-label="Mois suivant">
          →
        </button>
      </div>

      {/* Jours de semaine */}
      <div className="mb-1 grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 sm:text-xs"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const date = dateKey(year, month, day);
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const busy = pending && busyKey === date;

          return (
            <button
              key={date}
              onClick={() => cycle(date)}
              disabled={!isAdmin || busy}
              className={`flex min-h-[4.5rem] flex-col rounded-md border p-1 text-left transition-colors sm:min-h-[5.5rem] sm:p-2 ${
                isToday
                  ? 'border-accent bg-primary/10'
                  : 'border-steel/40 bg-night/40'
              } ${isAdmin ? 'cursor-pointer hover:border-accent' : 'cursor-default'} ${
                busy ? 'opacity-50' : ''
              }`}
            >
              <span
                className={`text-xs font-bold sm:text-sm ${
                  isToday ? 'text-accent' : 'text-slate-300'
                }`}
              >
                {day}
              </span>
              <div className="mt-auto flex flex-wrap gap-0.5">
                {ADMIN_USERNAMES.map((u) => {
                  const status = index.get(`${date}|${u}`);
                  if (!status) return null;
                  const color =
                    status === 'available'
                      ? 'bg-emerald-500/25 text-emerald-300 ring-emerald-500/50'
                      : 'bg-red-500/25 text-red-300 ring-red-500/50';
                  return (
                    <span
                      key={u}
                      className={`flex h-4 w-4 items-center justify-center rounded text-[0.55rem] font-bold ring-1 sm:h-5 sm:w-5 sm:text-[0.65rem] ${color}`}
                      title={`${displayName(u)} : ${
                        status === 'available' ? 'Disponible' : 'Indisponible'
                      }`}
                    >
                      {displayName(u).charAt(0)}
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-steel/40 pt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-500/40 ring-1 ring-emerald-500/60" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-red-500/40 ring-1 ring-red-500/60" />
          Indisponible
        </span>
        {isAdmin ? (
          <span className="italic">
            Clique sur un jour pour basculer ta dispo (disponible → indisponible → vide).
          </span>
        ) : (
          <span className="italic">Connecte-toi en tant qu’admin pour renseigner ta dispo.</span>
        )}
      </div>
    </div>
  );
}
