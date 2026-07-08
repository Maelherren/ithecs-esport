'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import SubmitButton from './SubmitButton';
import { createScrimEvent, updateScrimEvent } from '@/lib/actions/scrim';
import type { ScrimEvent } from '@/lib/types';

export default function ScrimForm({
  event,
  trigger = 'button',
}: {
  event?: ScrimEvent;
  trigger?: 'button' | 'link';
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isEdit = Boolean(event);

  return (
    <>
      {trigger === 'button' ? (
        <button className="btn-primary" onClick={() => setOpen(true)}>
          + Ajouter un scrim
        </button>
      ) : (
        <button
          className="text-sm font-semibold text-accent hover:underline"
          onClick={() => setOpen(true)}
        >
          ✎ Modifier
        </button>
      )}

      {open && (
        <Modal
          title={isEdit ? 'Modifier le scrim' : 'Nouveau scrim'}
          onClose={() => setOpen(false)}
        >
          <form
            action={async (fd) => {
              if (isEdit) await updateScrimEvent(fd);
              else await createScrimEvent(fd);
              setOpen(false);
              router.refresh();
            }}
            className="space-y-4"
          >
            {event && <input type="hidden" name="id" value={event.id} />}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date *</label>
                <input type="date" name="date" required defaultValue={event?.date} className="input" />
              </div>
              <div>
                <label className="label">Heure</label>
                <input type="time" name="time" defaultValue={event?.time ?? ''} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Adversaire (optionnel)</label>
              <input
                name="opponent"
                defaultValue={event?.opponent ?? ''}
                className="input"
                placeholder="À déterminer"
              />
            </div>
            <div>
              <label className="label">Notes (optionnel)</label>
              <textarea
                name="notes"
                rows={3}
                defaultValue={event?.notes ?? ''}
                className="input"
                placeholder="Format, map, remarques…"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                Annuler
              </button>
              <SubmitButton>{isEdit ? 'Enregistrer' : 'Créer'}</SubmitButton>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
