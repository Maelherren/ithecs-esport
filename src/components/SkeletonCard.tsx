// Placeholder de chargement réutilisable (animation pulse, couleur #1a2d5a).
// Utilisé comme fallback des <Suspense> pendant le fetch des données.

const BAR = '#1a2d5a';

export default function SkeletonCard({
  variant = 'default',
  lines = 3,
  className = '',
}: {
  variant?: 'default' | 'avatar';
  lines?: number;
  className?: string;
}) {
  if (variant === 'avatar') {
    return (
      <div className={`card flex animate-pulse flex-col items-center p-6 ${className}`}>
        <div className="h-24 w-24 rounded-full" style={{ backgroundColor: BAR }} />
        <div
          className="mt-4 h-4 w-2/3 rounded"
          style={{ backgroundColor: BAR }}
        />
        <div
          className="mt-2 h-3 w-1/3 rounded opacity-70"
          style={{ backgroundColor: BAR }}
        />
      </div>
    );
  }

  return (
    <div className={`card animate-pulse p-6 ${className}`}>
      <div className="h-5 w-1/2 rounded" style={{ backgroundColor: BAR }} />
      <div className="mt-3 h-3 w-1/3 rounded opacity-70" style={{ backgroundColor: BAR }} />
      <div className="mt-5 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded opacity-60"
            style={{ backgroundColor: BAR, width: `${92 - i * 14}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Fallback pour les pages Actualité / Information : garde le titre visible,
// et affiche une grille de cartes en chargement.
export function ArticlesSkeleton({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title heading-accent">{title}</h1>
        <p className="mt-1 text-slate-400">{description}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card animate-pulse overflow-hidden">
            <div className="aspect-video w-full" style={{ backgroundColor: BAR }} />
            <div className="space-y-2.5 p-5">
              <div className="h-3 w-1/4 rounded opacity-70" style={{ backgroundColor: BAR }} />
              <div className="h-4 w-3/4 rounded" style={{ backgroundColor: BAR }} />
              <div className="h-3 w-full rounded opacity-60" style={{ backgroundColor: BAR }} />
              <div className="h-3 w-5/6 rounded opacity-60" style={{ backgroundColor: BAR }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Grille de plusieurs SkeletonCard, pratique comme fallback de liste.
export function SkeletonGrid({
  count = 4,
  variant = 'default',
  className = 'grid grid-cols-1 gap-5 lg:grid-cols-2',
}: {
  count?: number;
  variant?: 'default' | 'avatar';
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}
