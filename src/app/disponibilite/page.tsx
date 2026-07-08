import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { getSession } from '@/lib/auth';
import { getAvailability } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function DisponibilitePage() {
  const [data, session] = await Promise.all([getAvailability(), getSession()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title heading-accent">Disponibilité</h1>
        <p className="mt-1 text-slate-400">
          Vue mensuelle des disponibilités de l’équipe.
        </p>
      </div>
      <AvailabilityCalendar data={data} currentUser={session} />
    </div>
  );
}
