import ArticlesBoard from '@/components/ArticlesBoard';
import { getSession } from '@/lib/auth';
import { getArticles } from '@/lib/data';
import { createNews, deleteNews, updateNews } from '@/lib/actions/articles';

export const dynamic = 'force-dynamic';

export default async function ActualitePage() {
  const [articles, session] = await Promise.all([getArticles('news'), getSession()]);

  return (
    <ArticlesBoard
      title="Actualité"
      description="Les dernières nouvelles de la team ITHECS."
      articles={articles}
      isSuper={session?.role === 'super-admin'}
      addLabel="+ Nouvel article"
      createAction={createNews}
      updateAction={updateNews}
      deleteAction={deleteNews}
      emptyLabel="Aucune actualité publiée pour le moment."
    />
  );
}
