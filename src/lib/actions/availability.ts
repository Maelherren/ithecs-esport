'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth';
import type { AvailabilityStatus } from '@/lib/types';
import { requireDate, str } from './helpers';

// Toggle de disponibilité : un admin agit uniquement sur SA propre case.
// - 'available' / 'unavailable' => upsert
// - 'clear'                     => suppression (retour à "non renseigné")
export async function setAvailability(formData: FormData) {
  const session = await requireAdmin();
  const date = requireDate(formData.get('date'));
  const status = str(formData.get('status'), 12);

  const supabase = createAdminClient();

  if (status === 'clear') {
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('username', session.username)
      .eq('date', date);
    if (error) throw new Error(error.message);
  } else {
    if (!['available', 'unavailable'].includes(status)) {
      throw new Error('Statut invalide.');
    }
    const { error } = await supabase.from('availability').upsert(
      {
        username: session.username,
        date,
        status: status as AvailabilityStatus,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'username,date' },
    );
    if (error) throw new Error(error.message);
  }

  revalidatePath('/disponibilite');
}
