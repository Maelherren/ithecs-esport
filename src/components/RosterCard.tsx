'use client';

import { useState } from 'react';
import Image from 'next/image';
import Modal from './Modal';
import Avatar from './Avatar';
import ProfileForm from './ProfileForm';
import type { RosterMember } from '@/lib/types';

type Field = { icon: string; label: string; value: string | null };

function InfoTile({ icon, label, value }: Field) {
  return (
    <div className="rounded-lg border border-steel/40 bg-night/40 p-3">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {icon} {label}
      </p>
      <p className="mt-0.5 font-semibold text-white">{value}</p>
    </div>
  );
}

function Section({ title, fields }: { title: string; fields: Field[] }) {
  const filled = fields.filter((f) => f.value);
  if (filled.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-accent">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {filled.map((f) => (
          <InfoTile key={f.label} {...f} />
        ))}
      </div>
    </div>
  );
}

export default function RosterCard({
  member: m,
  canEdit,
  isSuper,
}: {
  member: RosterMember;
  canEdit: boolean;
  isSuper: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const isCaptain = m.role_label.toLowerCase() === 'captain';
  const isChatax = m.username.toLowerCase() === 'chatax';

  const gameFields: Field[] = [
    {
      icon: '🏆',
      label: 'Trophées',
      value: m.trophies != null ? m.trophies.toLocaleString('fr-FR') : null,
    },
    {
      icon: '🎖️',
      label: 'Élo max',
      value: m.ranked_elo != null ? m.ranked_elo.toLocaleString('fr-FR') : null,
    },
    { icon: '⭐', label: 'Brawler préféré', value: m.fav_brawler },
    { icon: '🧩', label: 'Type de brawler', value: m.brawler_type },
    { icon: '🎯', label: 'Mode préféré', value: m.fav_mode },
  ];
  const persoFields: Field[] = [
    { icon: '🍔', label: 'Nourriture préférée', value: m.fav_food },
    { icon: '🥤', label: 'Boisson préférée', value: m.fav_drink },
    { icon: '🎨', label: 'Skin préféré', value: m.fav_skin },
  ];
  const hasAnyInfo =
    gameFields.some((f) => f.value) ||
    persoFields.some((f) => f.value) ||
    m.emote_url ||
    m.quote;

  const close = () => {
    setOpen(false);
    setEditing(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="card group flex w-full flex-col items-center p-6 text-center transition-transform hover:-translate-y-1 hover:border-accent/60"
      >
        <Avatar name={m.display_name} src={m.avatar_url} size={96} highlight={isChatax} />
        <p className="mt-4 text-lg font-bold text-white">{m.display_name}</p>
        <span
          className={`badge mt-1 ${
            isCaptain ? 'bg-gold/15 text-gold' : 'bg-primary/15 text-accent'
          }`}
        >
          {isCaptain ? '👑 Captain' : 'Member'}
        </span>
        <span className="mt-3 text-xs text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
          Voir le profil →
        </span>
      </button>

      {open && (
        <Modal
          title={editing ? `Éditer — ${m.display_name}` : m.display_name}
          onClose={close}
        >
          {editing ? (
            <ProfileForm
              member={m}
              isSuper={isSuper}
              onDone={close}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div className="space-y-5">
              {/* En-tête */}
              <div className="flex items-center gap-4">
                <Avatar
                  name={m.display_name}
                  src={m.avatar_url}
                  size={72}
                  highlight={isChatax}
                />
                <div>
                  <p className="text-lg font-bold text-white">{m.display_name}</p>
                  <span
                    className={`badge mt-1 ${
                      isCaptain ? 'bg-gold/15 text-gold' : 'bg-primary/15 text-accent'
                    }`}
                  >
                    {isCaptain ? '👑 Captain' : 'Member'}
                  </span>
                </div>
              </div>

              {/* Citation */}
              {m.quote && (
                <blockquote className="border-l-2 border-accent/60 pl-3 text-slate-300 italic">
                  « {m.quote} »
                </blockquote>
              )}

              {!hasAnyInfo && (
                <p className="text-sm text-slate-400">
                  {canEdit
                    ? 'Ton profil est vide — clique sur « Éditer » pour le remplir.'
                    : 'Ce membre n’a pas encore rempli son profil.'}
                </p>
              )}

              <Section title="🎮 En jeu" fields={gameFields} />

              {/* Emote préféré */}
              {m.emote_url && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-accent">😀 Emote préféré</h4>
                  <div className="inline-flex items-center justify-center rounded-lg border border-steel/40 bg-night/40 p-2">
                    <Image
                      src={m.emote_url}
                      alt="Emote préféré"
                      width={64}
                      height={64}
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                </div>
              )}

              <Section title="🎭 Perso" fields={persoFields} />

              {canEdit && (
                <div className="flex justify-end border-t border-steel/40 pt-4">
                  <button onClick={() => setEditing(true)} className="btn-primary">
                    ✎ Éditer
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
