import { Suspense } from 'react';
import ArticlesBoard from '@/components/ArticlesBoard';
import { ArticlesSkeleton } from '@/components/SkeletonCard';
import { getSession } from '@/lib/auth';
import { getArticles } from '@/lib/data';
import { createNews, deleteNews, updateNews } from '@/lib/actions/articles';

export const dynamic = 'force-dynamic';

const TITLE = 'Actualité';
const DESCRIPTION = 'Les dernières nouvelles de la team ITHECS.';

export default async function ActualitePage() {
  const session = await getSession();

  return (
    <Suspense fallback={<ArticlesSkeleton title={TITLE} description={DESCRIPTION} />}>
      <ActualiteContent isSuper={session?.role === 'super-admin'} />
    </Suspense>
  );
}

async function ActualiteContent({ isSuper }: { isSuper: boolean }) {
  const articles = await getArticles('news');

  return (
    <ArticlesBoard
      title={TITLE}
      description={DESCRIPTION}
      articles={articles}
      isSuper={isSuper}
      addLabel="+ Nouvel article"
      createAction={createNews}
      updateAction={updateNews}
      deleteAction={deleteNews}
      emptyLabel="Aucune actualité publiée pour le moment."
    />
  );
}
