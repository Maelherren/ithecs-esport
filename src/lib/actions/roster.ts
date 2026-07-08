'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireSuperAdmin } from '@/lib/auth';
import { str } from './helpers';
import { uploadImage } from './upload';

// Mise à jour d'un membre du roster (avatar + rôle). Chatax uniquement.
export async function updateRosterMember(formData: FormData) {
  await requireSuperAdmin();
  const username = str(formData.get('username'), 40).toLowerCase();
  if (!username) throw new Error('Membre manquant.');

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  const roleLabel = str(formData.get('role_label'), 40);
  if (roleLabel) patch.role_label = roleLabel;

  const avatar = await uploadImage(formData.get('avatar') as File | null, 'avatars');
  if (avatar) patch.avatar_url = avatar;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('roster')
    .update(patch)
    .eq('username', username);
  if (error) throw new Error(error.message);
  revalidatePath('/');
}
