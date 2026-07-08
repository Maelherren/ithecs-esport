'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import SubmitButton from './SubmitButton';
import { createResult, updateResult } from '@/lib/actions/results';
import type { MatchResult } from '@/lib/types';

type RoundDraft = {
  sets_won: number;
  sets_lost: number;
  rounds_won: number;
  rounds_lost: number;
  sets_to_win: number;
};

const emptyRound = (): RoundDraft => ({
  sets_won: 0,
  sets_lost: 0,
  rounds_won: 0,
  rounds_lost: 0,
  sets_to_win: 1,
});

export default function ResultForm({
  result,
  trigger = 'button',
}: {
  result?: MatchResult;
  trigger?: 'button' | 'link';
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isEdit = Boolean(result);

  const [rounds, setRounds] = useState<RoundDraft[]>(
    result?.rounds?.length
      ? result.rounds.map((r) => ({
          sets_won: r.sets_won,
          sets_lost: r.sets_lost,
          rounds_won: r.rounds_won,
          rounds_lost: r.rounds_lost,
          sets_to_win: r.sets_to_win,
        }))
      : [emptyRound()],
  );

  function updateRound(i: number, patch: Partial<RoundDraft>) {
    setRounds((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRound() {
    setRounds((rs) => [...rs, emptyRound()]);
  }
  function removeRound(i: number) {
    setRounds((rs) => rs.filter((_, idx) => idx !== i));
  }

  function reset() {
    setRounds(
      result?.rounds?.length
        ? result.rounds.map((r) => ({
            sets_won: r.sets_won,
            sets_lost: r.sets_lost,
            rounds_won: r.rounds_won,
            rounds_lost: r.rounds_lost,
            sets_to_win: r.sets_to_win,
          }))
        : [emptyRound()],
    );
  }

  return (
    <>
      {trigger === 'button' ? (
        <button className="btn-primary" onClick={() => setOpen(true)}>
          + Ajouter un match
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
          title={isEdit ? 'Modifier le match' : 'Nouveau résultat'}
          onClose={() => {
            setOpen(false);
            reset();
          }}
        >
          <form
            action={async (fd) => {
              fd.set('rounds_json', JSON.stringify(rounds));
              if (isEdit) await updateResult(fd);
              else await createResult(fd);
              setOpen(false);
              router.refresh();
            }}
            className="space-y-4"
          >
            {result && <input type="hidden" name="id" value={result.id} />}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Tournoi / Adversaire *</label>
                <input name="name" required defaultValue={result?.name} className="input" />
              </div>
              <div>
                <label className="label">Date *</label>
                <input type="date" name="date" required defaultValue={result?.date} className="input" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="label mb-0">Rounds</label>
                <button type="button" onClick={addRound} className="btn-ghost px-2 py-1 text-xs">
                  + Ajouter un round
                </button>
              </div>

              <div className="space-y-3">
                {rounds.map((r, i) => (
                  <div key={i} className="rounded-md border border-steel/50 bg-night/50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Round {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeRound(i)}
                        className="text-xs text-red-300 hover:text-red-400"
                      >
                        🗑 Supprimer
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <NumField label="Sets gagnés" value={r.sets_won} onChange={(v) => updateRound(i, { sets_won: v })} />
                      <NumField label="Sets perdus" value={r.sets_lost} onChange={(v) => updateRound(i, { sets_lost: v })} />
                      <NumField label="Rounds +" value={r.rounds_won} onChange={(v) => updateRound(i, { rounds_won: v })} />
                      <NumField label="Rounds -" value={r.rounds_lost} onChange={(v) => updateRound(i, { rounds_lost: v })} />
                      <div>
                        <label className="label">Format</label>
                        <select
                          value={r.sets_to_win}
                          onChange={(e) => updateRound(i, { sets_to_win: Number(e.target.value) })}
                          className="input px-2"
                        >
                          <option value={1}>Bo1 (1)</option>
                          <option value={2}>Bo3 (2)</option>
                          <option value={3}>Bo5 (3)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                {rounds.length === 0 && (
                  <p className="text-sm italic text-slate-500">Aucun round. Ajoutes-en un.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="btn-ghost"
              >
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

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="input px-2"
      />
    </div>
  );
}
