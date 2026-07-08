import ArticlesBoard from '@/components/ArticlesBoard';
import { getSession } from '@/lib/auth';
import { getArticles } from '@/lib/data';
import { createInfo, deleteInfo, updateInfo } from '@/lib/actions/articles';

export const dynamic = 'force-dynamic';

export default async function InformationPage() {
  const [articles, session] = await Promise.all([getArticles('info'), getSession()]);

  return (
    <ArticlesBoard
      title="Information"
      description="Règlement, présentation de la team et infos pratiques."
      articles={articles}
      isSuper={session?.role === 'super-admin'}
      addLabel="+ Nouvelle info"
      createAction={createInfo}
      updateAction={updateInfo}
      deleteAction={deleteInfo}
      emptyLabel="Aucune information publiée pour le moment."
    />
  );
}
