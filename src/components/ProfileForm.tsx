'use client';

import { useRouter } from 'next/navigation';
import SubmitButton from './SubmitButton';
import { updateProfile } from '@/lib/actions/roster';
import { BRAWLER_TYPES, GAME_MODES, type RosterMember } from '@/lib/types';

export default function ProfileForm({
  member,
  isSuper,
  onDone,
  onCancel,
}: {
  member: RosterMember;
  isSuper: boolean;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();

  return (
    <form
      action={async (fd) => {
        await updateProfile(fd);
        onDone();
        router.refresh();
      }}
      className="space-y-5"
    >
      <input type="hidden" name="username" value={member.username} />

      {/* Identité */}
      <div className="grid gap-4 sm:grid-cols-2">
        {isSuper && (
          <div>
            <label className="label">Rôle</label>
            <select name="role_label" defaultValue={member.role_label} className="input">
              <option value="Captain">Captain</option>
              <option value="Member">Member</option>
            </select>
          </div>
        )}
        <div className={isSuper ? '' : 'sm:col-span-2'}>
          <label className="label">Avatar</label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            className="input file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-white"
          />
          <p className="mt-1 text-xs text-slate-500">Vide = inchangé. Max 5 Mo.</p>
        </div>
      </div>

      {/* Section En jeu */}
      <fieldset className="space-y-4 rounded-lg border border-steel/40 p-4">
        <legend className="px-2 text-sm font-semibold text-accent">🎮 En jeu</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Trophées</label>
            <input
              type="number"
              name="trophies"
              min={0}
              step={100}
              defaultValue={member.trophies ?? ''}
              placeholder="ex : 45000"
              className="input"
            />
            <p className="mt-1 text-xs text-slate-500">Arrondi au palier de 100.</p>
          </div>
          <div>
            <label className="label">Élo max (Ranked)</label>
            <input
              type="number"
              name="ranked_elo"
              min={0}
              defaultValue={member.ranked_elo ?? ''}
              placeholder="ex : 1050"
              className="input"
            />
            <p className="mt-1 text-xs text-slate-500">Élo maximum atteint.</p>
          </div>
          <div>
            <label className="label">Brawler préféré</label>
            <input
              type="text"
              name="fav_brawler"
              defaultValue={member.fav_brawler ?? ''}
              placeholder="ex : Spike"
              className="input"
            />
          </div>
          <div>
            <label className="label">Type de brawler</label>
            <select name="brawler_type" defaultValue={member.brawler_type ?? ''} className="input">
              <option value="">—</option>
              {BRAWLER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Mode préféré</label>
            <select name="fav_mode" defaultValue={member.fav_mode ?? ''} className="input">
              <option value="">—</option>
              {GAME_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Emote préféré (image)</label>
            <input
              type="file"
              name="emote"
              accept="image/*"
              className="input file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-white"
            />
          </div>
        </div>
      </fieldset>

      {/* Section Perso */}
      <fieldset className="space-y-4 rounded-lg border border-steel/40 p-4">
        <legend className="px-2 text-sm font-semibold text-accent">🎭 Perso</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nourriture préférée</label>
            <input
              type="text"
              name="fav_food"
              defaultValue={member.fav_food ?? ''}
              placeholder="ex : Pizza"
              className="input"
            />
          </div>
          <div>
            <label className="label">Boisson préférée</label>
            <input
              type="text"
              name="fav_drink"
              defaultValue={member.fav_drink ?? ''}
              placeholder="ex : Ice Tea"
              className="input"
            />
          </div>
          <div>
            <label className="label">Skin préféré</label>
            <input
              type="text"
              name="fav_skin"
              defaultValue={member.fav_skin ?? ''}
              placeholder="ex : Spike Robot"
              className="input"
            />
          </div>
          <div>
            <label className="label">Citation / devise</label>
            <input
              type="text"
              name="quote"
              maxLength={160}
              defaultValue={member.quote ?? ''}
              placeholder="ex : We play to win."
              className="input"
            />
          </div>
        </div>
      </fieldset>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Annuler
        </button>
        <SubmitButton>Enregistrer</SubmitButton>
      </div>
    </form>
  );
}
