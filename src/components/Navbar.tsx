'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import LoginModal from './LoginModal';
import UserMenu from './UserMenu';
import type { SessionUser } from '@/lib/types';

const LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/calendrier-matcherino', label: 'Calendrier Matcherino' },
  { href: '/calendrier-scrim', label: 'Calendrier Scrim' },
  { href: '/disponibilite', label: 'Disponibilité' },
  { href: '/resultats', label: 'Résultats' },
  { href: '/actualite', label: 'Actualité' },
  { href: '/information', label: 'Information' },
];

export default function Navbar({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-steel/50 bg-night/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo à gauche */}
          <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
            <Logo className="h-8 w-auto" />
          </Link>

          {/* Liens desktop */}
          <div className="hidden items-center gap-1 xl:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary/15 text-accent shadow-glow'
                    : 'text-slate-300 hover:bg-steel/40 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth à droite */}
          <div className="flex items-center gap-2">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <button onClick={() => setLoginOpen(true)} className="btn-primary">
                Connexion
              </button>
            )}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="btn-ghost px-2 xl:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>

        {/* Menu mobile */}
        {mobileOpen && (
          <div className="animate-fade-in border-t border-steel/50 bg-abyss/95 px-4 py-3 xl:hidden">
            <div className="flex flex-col gap-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary/15 text-accent'
                      : 'text-slate-300 hover:bg-steel/40 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </>
  );
}
