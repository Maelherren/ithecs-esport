'use client';

import { useState } from 'react';
import type { MatchResult } from '@/lib/types';
import { isRoundWon } from '@/lib/data';

// Détail dépliable des rounds d'un match.
export default function ResultAccordion({ result }: { result: MatchResult }) {
  const [open, setOpen] = useState(false);
  const rounds = result.rounds ?? [];
  if (rounds.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
      >
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
        {open ? 'Masquer' : 'Voir'} le détail des rounds ({rounds.length})
      </button>

      {open && (
        <div className="animate-fade-in mt-3 space-y-2">
          {rounds.map((r) => {
            const won = isRoundWon(r.sets_won, r.sets_to_win);
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-steel/40 bg-night/50 px-3 py-2 text-sm"
              >
                <span className="font-semibold text-white">Round {r.round_number}</span>
                <span className="text-slate-300">
                  {r.sets_won} set{r.sets_won > 1 ? 's' : ''} – {r.sets_lost} set
                  {r.sets_lost > 1 ? 's' : ''}
                  <span className="mx-2 text-slate-600">|</span>
                  Rounds gagnés : {r.rounds_won} – {r.rounds_lost}
                </span>
                <span className="text-xs text-slate-500">Bo{r.sets_to_win * 2 - 1}</span>
                <span
                  className={`badge ${
                    won ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                  }`}
                >
                  {won ? 'Gagné' : 'Perdu'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
