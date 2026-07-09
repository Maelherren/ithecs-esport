import { Suspense } from 'react';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import SkeletonCard from '@/components/SkeletonCard';
import { getSession } from '@/lib/auth';
import { getAvailability } from '@/lib/data';
import type { SessionUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DisponibilitePage() {
  const session = await getSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title heading-accent">Disponibilité</h1>
        <p className="mt-1 text-slate-400">
          Vue mensuelle des disponibilités de l’équipe.
        </p>
      </div>
      <Suspense fallback={<SkeletonCard lines={6} className="h-96" />}>
        <AvailabilityContent session={session} />
      </Suspense>
    </div>
  );
}

async function AvailabilityContent({ session }: { session: SessionUser | null }) {
  const data = await getAvailability();
  return <AvailabilityCalendar data={data} currentUser={session} />;
}
