'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { loginAction, type LoginState } from '@/lib/actions/auth';

const INITIAL: LoginState = { error: null, ok: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? 'Connexion…' : 'Se connecter'}
    </button>
  );
}

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [state, formAction] = useFormState(loginAction, INITIAL);

  // Fermeture au succès + rafraîchissement pour recharger la session serveur.
  useEffect(() => {
    if (state.ok) {
      onClose();
      router.refresh();
    }
  }, [state.ok, onClose, router]);

  // Fermeture avec Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card animate-fade-in w-full max-w-sm p-6 shadow-glow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Connexion</h2>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-white"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="username">
              Nom d’utilisateur
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              required
              className="input"
              placeholder="ex : chatax"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
