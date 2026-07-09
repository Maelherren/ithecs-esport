import { Suspense } from 'react';
import ArticlesBoard from '@/components/ArticlesBoard';
import { ArticlesSkeleton } from '@/components/SkeletonCard';
import { getSession } from '@/lib/auth';
import { getArticles } from '@/lib/data';
import { createInfo, deleteInfo, updateInfo } from '@/lib/actions/articles';

export const dynamic = 'force-dynamic';

const TITLE = 'Information';
const DESCRIPTION = 'Règlement, présentation de la team et infos pratiques.';

export default async function InformationPage() {
  const session = await getSession();

  return (
    <Suspense fallback={<ArticlesSkeleton title={TITLE} description={DESCRIPTION} />}>
      <InformationContent isSuper={session?.role === 'super-admin'} />
    </Suspense>
  );
}

async function InformationContent({ isSuper }: { isSuper: boolean }) {
  const articles = await getArticles('info');

  return (
    <ArticlesBoard
      title={TITLE}
      description={DESCRIPTION}
      articles={articles}
      isSuper={isSuper}
      addLabel="+ Nouvelle info"
      createAction={createInfo}
      updateAction={updateInfo}
      deleteAction={deleteInfo}
      emptyLabel="Aucune information publiée pour le moment."
    />
  );
}
