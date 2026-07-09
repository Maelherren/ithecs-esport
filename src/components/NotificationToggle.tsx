'use client';

import { useEffect, useState } from 'react';
import { subscribePush, unsubscribePush } from '@/lib/actions/push';

// Convertit la clé VAPID (base64url) en Uint8Array pour applicationServerKey.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

type State = 'loading' | 'unsupported' | 'off' | 'on' | 'busy';

export default function NotificationToggle() {
  const [state, setState] = useState<State>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    if (!supported) {
      setState('unsupported');
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? 'on' : 'off'))
      .catch(() => setState('off'));
  }, []);

  async function enable() {
    setError(null);
    setState('busy');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError('Permission refusée dans le navigateur.');
        setState('off');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error('Clé VAPID publique absente.');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
      });
      await subscribePush(JSON.parse(JSON.stringify(sub)));
      setState('on');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue.');
      setState('off');
    }
  }

  async function disable() {
    setError(null);
    setState('busy');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setState('off');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue.');
      setState('on');
    }
  }

  if (state === 'unsupported') {
    return (
      <p className="px-4 py-3 text-xs text-slate-500">
        🔔 Notifications non supportées sur ce navigateur.
      </p>
    );
  }

  const label =
    state === 'loading' || state === 'busy'
      ? '…'
      : state === 'on'
        ? '🔕 Désactiver les notifications'
        : '🔔 Activer les notifications';

  return (
    <div className="border-b border-steel/50">
      <button
        onClick={state === 'on' ? disable : enable}
        disabled={state === 'loading' || state === 'busy'}
        className="w-full px-4 py-3 text-left text-sm text-slate-300 transition-colors hover:bg-steel/40 hover:text-white disabled:opacity-50"
      >
        {label}
      </button>
      {error && <p className="px-4 pb-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
