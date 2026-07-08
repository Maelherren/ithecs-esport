'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import SubmitButton from './SubmitButton';
import { updateRosterMember } from '@/lib/actions/roster';
import type { RosterMember } from '@/lib/types';

export default function RosterEditor({ member }: { member: RosterMember }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute right-2 top-2 rounded-md border border-steel/60 bg-night/70 px-2 py-1 text-xs text-slate-300 opacity-0 transition-opacity hover:border-accent hover:text-white group-hover:opacity-100"
        title="Modifier ce membre"
      >
        ✎ Éditer
      </button>

      {open && (
        <Modal title={`Éditer ${member.display_name}`} onClose={() => setOpen(false)}>
          <form
            action={async (fd) => {
              await updateRosterMember(fd);
              setOpen(false);
              router.refresh();
            }}
            className="space-y-4"
          >
            <input type="hidden" name="username" value={member.username} />
            <div>
              <label className="label">Rôle</label>
              <select name="role_label" defaultValue={member.role_label} className="input">
                <option value="Captain">Captain</option>
                <option value="Member">Member</option>
              </select>
            </div>
            <div>
              <label className="label">Avatar (image)</label>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                className="input file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-white"
              />
              <p className="mt-1 text-xs text-slate-500">
                Laisse vide pour conserver l’avatar actuel. Max 5 Mo.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                Annuler
              </button>
              <SubmitButton>Enregistrer</SubmitButton>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
