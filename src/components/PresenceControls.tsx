'use client';

import { useTransition } from 'react';
import {
  ADMIN_USERNAMES,
  displayName,
  type MatcherinoStatus,
  type Role,
  type ScrimStatus,
} from '@/lib/types';

type Variant = 'matcherino' | 'scrim';

const STATUS_META: Record<
  string,
  { icon: string; label: string; on: string; off: string }
> = {
  present: {
    icon: '✅',
    label: 'Présent',
    on: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60',
    off: 'border-steel/60 text-slate-400 hover:border-emerald-500/60',
  },
  absent: {
    icon: '❌',
    label: 'Absent',
    on: 'bg-red-500/20 text-red-300 border-red-500/60',
    off: 'border-steel/60 text-slate-400 hover:border-red-500/60',
  },
  uncertain: {
    icon: '❓',
    label: 'Incertain',
    on: 'bg-amber-500/20 text-amber-300 border-amber-500/60',
    off: 'border-steel/60 text-slate-400 hover:border-amber-500/60',
  },
};

export default function PresenceControls({
  eventId,
  variant,
  responses,
  currentUser,
  action,
}: {
  eventId: string;
  variant: Variant;
  responses: { username: string; status: string }[];
  currentUser: { username: string; role: Role } | null;
  action: (formData: FormData) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const statuses = variant === 'matcherino'
    ? (['present', 'absent', 'uncertain'] as const)
    : (['present', 'absent'] as const);

  const byUser = new Map(responses.map((r) => [r.username.toLowerCase(), r.status]));
  const isAdmin =
    currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin');

  function submit(status: string) {
    const fd = new FormData();
    fd.set('event_id', eventId);
    fd.set('status', status);
    startTransition(() => action(fd));
  }

  return (
    <div className="space-y-2">
      {ADMIN_USERNAMES.map((username) => {
        const current = byUser.get(username);
        const isMe = currentUser?.username.toLowerCase() === username;
        return (
          <div
            key={username}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-steel/40 bg-night/40 px-3 py-2"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/70 text-xs font-bold text-white">
                {displayName(username).charAt(0)}
              </span>
              {displayName(username)}
            </span>

            <div className="flex gap-1.5">
              {statuses.map((s) => {
                const meta = STATUS_META[s];
                const active = current === s;
                // L'admin connecté peut cliquer sur SA propre ligne ; sinon lecture seule.
                if (isMe && isAdmin) {
                  return (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      disabled={pending}
                      className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-50 ${
                        active ? meta.on : meta.off
                      }`}
                      title={meta.label}
                    >
                      {meta.icon}
                    </button>
                  );
                }
                // Lecture seule : n'affiche que le statut choisi
                if (!active) return null;
                return (
                  <span
                    key={s}
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${meta.on}`}
                    title={meta.label}
                  >
                    {meta.icon} {meta.label}
                  </span>
                );
              })}
              {!current && !(isMe && isAdmin) && (
                <span className="text-xs italic text-slate-500">Non renseigné</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
