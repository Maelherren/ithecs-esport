'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const DISMISS_KEY = 'ithecs-install-dismissed';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault(); // empêche la mini-infobar par défaut de Chrome
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-md animate-fade-in">
      <div className="flex items-center gap-3 rounded-xl border border-accent/50 bg-abyss/95 p-3 shadow-glow backdrop-blur">
        <Image src="/icon-192.png" alt="ITHECS" width={44} height={44} className="rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Installer l’app ITHECS</p>
          <p className="truncate text-xs text-slate-400">
            Accès rapide et notifications, comme une vraie app.
          </p>
        </div>
        <button onClick={dismiss} className="btn-ghost px-3 py-1.5 text-xs">
          Plus tard
        </button>
        <button onClick={install} className="btn-primary px-3 py-1.5 text-xs">
          Installer
        </button>
      </div>
    </div>
  );
}
