'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/lib/actions/auth';
import RoleBadge from './RoleBadge';
import NotificationToggle from './NotificationToggle';
import type { SessionUser } from '@/lib/types';

export default function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleLogout() {
    await logoutAction();
    setOpen(false);
    router.refresh();
  }

  const isSuper = user.role === 'super-admin';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-steel/70 bg-abyss/60 px-2 py-1.5 transition-colors hover:border-accent"
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white ${
            isSuper ? 'bg-gold/80 text-night' : 'bg-primary'
          }`}
        >
          {user.username.charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-sm font-semibold text-slate-100 sm:inline">
          {user.username}
        </span>
        <RoleBadge role={user.role} />
      </button>

      {open && (
        <div className="animate-fade-in absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-steel/70 bg-abyss shadow-glow-lg">
          <div className="border-b border-steel/50 px-4 py-3">
            <p className="text-sm font-semibold text-white">{user.username}</p>
            <div className="mt-1">
              <RoleBadge role={user.role} showLabel />
            </div>
          </div>
          <NotificationToggle />
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left text-sm text-slate-300 transition-colors hover:bg-steel/40 hover:text-white"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
