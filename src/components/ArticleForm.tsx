'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './Modal';
import SubmitButton from './SubmitButton';
import type { Article } from '@/lib/types';

// Formulaire générique d'article (Actualité / Information).
// Les Server Actions create/update sont passées en props par la page.
export default function ArticleForm({
  action,
  article,
  addLabel,
  trigger = 'button',
}: {
  action: (formData: FormData) => Promise<void>;
  article?: Article;
  addLabel: string;
  trigger?: 'button' | 'link';
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const isEdit = Boolean(article);

  return (
    <>
      {trigger === 'button' ? (
        <button className="btn-primary" onClick={() => setOpen(true)}>
          {addLabel}
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
          title={isEdit ? 'Modifier' : 'Nouvelle publication'}
          onClose={() => setOpen(false)}
        >
          <form
            action={async (fd) => {
              await action(fd);
              setOpen(false);
              router.refresh();
            }}
            className="space-y-4"
          >
            {article && <input type="hidden" name="id" value={article.id} />}
            <div>
              <label className="label">Titre *</label>
              <input name="title" required defaultValue={article?.title} className="input" />
            </div>
            <div>
              <label className="label">Contenu</label>
              <textarea
                name="content"
                rows={6}
                defaultValue={article?.content}
                className="input"
                placeholder="Rédige le contenu…"
              />
            </div>
            <div>
              <label className="label">Image {isEdit ? '(remplace l’actuelle)' : ''}</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="input file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-white"
              />
              <p className="mt-1 text-xs text-slate-500">
                Formats : jpg, png, webp, gif, avif — max 5 Mo.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
                Annuler
              </button>
              <SubmitButton>{isEdit ? 'Enregistrer' : 'Publier'}</SubmitButton>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
