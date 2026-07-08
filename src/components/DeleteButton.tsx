'use client';

import { useState, useTransition } from 'react';

// Bouton de suppression avec confirmation en deux temps (pas d'alert() natif).
export default function DeleteButton({
  id,
  action,
  label = '🗑 Supprimer',
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    const fd = new FormData();
    fd.set('id', id);
    startTransition(() => action(fd));
  }

  if (!confirming) {
    return (
      <button className="btn-danger" onClick={() => setConfirming(true)}>
        {label}
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-xs text-slate-400">Confirmer ?</span>
      <button className="btn-danger" onClick={remove} disabled={pending}>
        {pending ? '…' : 'Oui, supprimer'}
      </button>
      <button className="btn-ghost" onClick={() => setConfirming(false)} disabled={pending}>
        Annuler
      </button>
    </span>
  );
}
