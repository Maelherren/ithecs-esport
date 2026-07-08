'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import SubmitButton from './SubmitButton';
import {
  createMatcherinoEvent,
  updateMatcherinoEvent,
} from '@/lib/actions/matcherino';
import type { MatcherinoEvent } from '@/lib/types';

export default function MatcherinoForm({
  event,
  trigger = 'button',
}: {
  event?: MatcherinoEvent;
  trigger?: 'button' | 'link';
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isEdit = Boolean(event);

  return (
    <>
      {trigger === 'button' ? (
        <button className="btn-primary" onClick={() => setOpen(true)}>
          + Ajouter un événement
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
          title={isEdit ? 'Modifier l’événement' : 'Nouvel événement Matcherino'}
          onClose={() => setOpen(false)}
        >
          <form
            action={async (fd) => {
              if (isEdit) await updateMatcherinoEvent(fd);
              else await createMatcherinoEvent(fd);
              setOpen(false);
              router.refresh();
            }}
            className="space-y-4"
          >
            {event && <input type="hidden" name="id" value={event.id} />}

            <div>
              <label className="label">Nom du tournoi *</label>
              <input
                name="name"
                required
                defaultValue={event?.name}
                className="input"
                placeholder="ex : Matcherino Cup #12"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Date *</label>
                <input type="date" name="date" required defaultValue={event?.date} className="input" />
              </div>
              <div>
                <label className="label">Heure du match</label>
                <input type="time" name="match_time" defaultValue={event?.match_time ?? ''} className="input" />
              </div>
              <div>
                <label className="label">Heure de RDV</label>
                <input type="time" name="rdv_time" defaultValue={event?.rdv_time ?? ''} className="input" />
              </div>
              <div>
                <label className="label">Heure de check-in</label>
                <input type="time" name="checkin_time" defaultValue={event?.checkin_time ?? ''} className="input" />
              </div>
              <div>
                <label className="label">Position dans la file</label>
                <input
                  type="number"
                  min={1}
                  name="queue_position"
                  defaultValue={event?.queue_position ?? ''}
                  className="input"
                  placeholder="ex : 12"
                />
              </div>
              <div>
                <label className="label">Nb max d’équipes</label>
                <input
                  type="number"
                  min={1}
                  name="queue_max"
                  defaultValue={event?.queue_max ?? ''}
                  className="input"
                  placeholder="ex : 64"
                />
              </div>
            </div>

            <div>
              <label className="label">Lien Matcherino (optionnel)</label>
              <input
                type="url"
                name="matcherino_link"
                defaultValue={event?.matcherino_link ?? ''}
                className="input"
                placeholder="https://matcherino.com/..."
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
