'use client';

import { useEffect, useState } from 'react';

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

// Countdown live vers une date/heure ISO. `compact` pour un rendu en ligne.
export default function Countdown({
  target,
  compact = false,
}: {
  target: string;
  compact?: boolean;
}) {
  const targetMs = new Date(target).getTime();
  const [t, setT] = useState(() => diff(targetMs));

  useEffect(() => {
    const id = setInterval(() => setT(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (Number.isNaN(targetMs)) return null;

  if (t.done) {
    return (
      <span className="badge bg-red-500/15 text-red-300">En cours / passé</span>
    );
  }

  if (compact) {
    return (
      <span className="font-mono text-sm font-semibold text-accent">
        {t.d > 0 && `${t.d}j `}
        {String(t.h).padStart(2, '0')}:{String(t.m).padStart(2, '0')}:
        {String(t.s).padStart(2, '0')}
      </span>
    );
  }

  const cells = [
    { v: t.d, l: 'Jours' },
    { v: t.h, l: 'Heures' },
    { v: t.m, l: 'Min' },
    { v: t.s, l: 'Sec' },
  ];
  return (
    <div className="flex gap-2">
      {cells.map((c) => (
        <div
          key={c.l}
          className="flex min-w-[3.5rem] flex-col items-center rounded-md border border-steel/60 bg-night/70 px-2 py-1.5"
        >
          <span className="font-mono text-xl font-bold text-white">
            {String(c.v).padStart(2, '0')}
          </span>
          <span className="text-[0.6rem] uppercase tracking-wider text-slate-400">
            {c.l}
          </span>
        </div>
      ))}
    </div>
  );
}
