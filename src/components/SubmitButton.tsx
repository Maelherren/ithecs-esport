'use client';

import { useFormStatus } from 'react-dom';

// Bouton de soumission qui affiche l'état "en cours" des Server Actions.
export default function SubmitButton({
  children,
  className = 'btn-primary',
  pendingLabel = 'Enregistrement…',
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
