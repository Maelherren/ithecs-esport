import { Suspense } from 'react';
import ResultForm from '@/components/ResultForm';
import ResultAccordion from '@/components/ResultAccordion';
import DeleteButton from '@/components/DeleteButton';
import SkeletonCard from '@/components/SkeletonCard';
import { getSession } from '@/lib/auth';
import { computeStats, getResults, isMatchWon } from '@/lib/data';
import { deleteResult } from '@/lib/actions/results';
import { formatDateShort } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ResultatsPage() {
  const session = await getSession();
  const isSuper = session?.role === 'super-admin';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title heading-accent">Résultats</h1>
          <p className="mt-1 text-slate-400">Historique des matchs et tournois.</p>
        </div>
        {isSuper && <ResultForm />}
      </div>

      <Suspense fallback={<ResultsSkeleton />}>
        <ResultsContent isSuper={isSuper} />
      </Suspense>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card animate-pulse p-4">
            <div className="mx-auto h-8 w-12 rounded" style={{ backgroundColor: '#1a2d5a' }} />
            <div
              className="mx-auto mt-2 h-3 w-16 rounded opacity-70"
              style={{ backgroundColor: '#1a2d5a' }}
            />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}

async function ResultsContent({ isSuper }: { isSuper: boolean }) {
  const results = await getResults();
  const stats = computeStats(results);

  return (
    <>
      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-emerald-300">{stats.wins}</p>
          <p className="text-xs uppercase tracking-wider text-slate-400">Victoires</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-red-300">{stats.losses}</p>
          <p className="text-xs uppercase tracking-wider text-slate-400">Défaites</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-accent">{stats.winRate}%</p>
          <p className="text-xs uppercase tracking-wider text-slate-400">Win rate</p>
        </div>
      </div>

      {results.length === 0 && (
        <div className="card p-8 text-center text-slate-400">
          Aucun résultat enregistré pour le moment.
        </div>
      )}

      <div className="space-y-4">
        {results.map((r) => {
          const won = isMatchWon(r);
          return (
            <article key={r.id} className="card animate-fade-in p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">{r.name}</h2>
                  <p className="text-sm text-slate-400">{formatDateShort(r.date)}</p>
                </div>
                <span
                  className={`badge text-sm ${
                    won
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-red-500/15 text-red-300'
                  }`}
                >
                  {won ? '✅ Victoire' : '❌ Défaite'}
                </span>
              </div>

              <ResultAccordion result={r} />

              {isSuper && (
                <div className="mt-4 flex items-center gap-3 border-t border-steel/40 pt-4">
                  <ResultForm result={r} trigger="link" />
                  <DeleteButton id={r.id} action={deleteResult} />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
