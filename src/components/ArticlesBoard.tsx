import Image from 'next/image';
import ArticleForm from './ArticleForm';
import DeleteButton from './DeleteButton';
import type { Article } from '@/lib/types';
import { formatDateShort } from '@/lib/format';

// Grille de cartes d'articles, réutilisée par Actualité et Information.
export default function ArticlesBoard({
  title,
  description,
  articles,
  isSuper,
  addLabel,
  createAction,
  updateAction,
  deleteAction,
  emptyLabel,
}: {
  title: string;
  description: string;
  articles: Article[];
  isSuper: boolean;
  addLabel: string;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  emptyLabel: string;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title heading-accent">{title}</h1>
          <p className="mt-1 text-slate-400">{description}</p>
        </div>
        {isSuper && <ArticleForm action={createAction} addLabel={addLabel} />}
      </div>

      {articles.length === 0 && (
        <div className="card p-8 text-center text-slate-400">{emptyLabel}</div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <article
            key={a.id}
            className="card animate-fade-in flex flex-col overflow-hidden"
          >
            {a.image_url ? (
              <div className="relative aspect-video w-full overflow-hidden bg-night">
                <Image
                  src={a.image_url}
                  alt={a.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-abyss to-steel/40 text-4xl">
                🎮
              </div>
            )}

            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                {formatDateShort(a.created_at.slice(0, 10))}
              </p>
              <h2 className="mt-1 text-lg font-bold text-white">{a.title}</h2>
              <p className="mt-2 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {a.content}
              </p>

              {isSuper && (
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-steel/40 pt-4">
                  <ArticleForm
                    action={updateAction}
                    article={a}
                    addLabel={addLabel}
                    trigger="link"
                  />
                  <DeleteButton id={a.id} action={deleteAction} />
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
