'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth';
import { str, optionalStr, optionalInt } from './helpers';
import { uploadImage } from './upload';
import { ADMIN_USERNAMES, displayName } from '@/lib/types';

// Arrondit au palier de 100 le plus proche (ex : 23 456 → 23 500).
function roundTo100(n: number): number {
  return Math.max(0, Math.round(n / 100) * 100);
}

// Mise à jour d'un profil du roster.
// Chaque admin ne peut éditer QUE le sien ; le super-admin peut éditer tout le monde.
export async function updateProfile(formData: FormData) {
  const session = await requireAdmin();
  const username = str(formData.get('username'), 40).toLowerCase();
  if (!ADMIN_USERNAMES.includes(username as (typeof ADMIN_USERNAMES)[number])) {
    throw new Error('Membre inconnu.');
  }
  if (username !== session.username.toLowerCase() && session.role !== 'super-admin') {
    throw new Error('Tu ne peux éditer que ton propre profil.');
  }

  const order = ADMIN_USERNAMES.indexOf(username as (typeof ADMIN_USERNAMES)[number]);

  const patch: Record<string, unknown> = {
    username,
    display_name: displayName(username),
    sort_order: order < 0 ? 0 : order,
    updated_at: new Date().toISOString(),
    ranked_rank: optionalStr(formData.get('ranked_rank'), 40),
    fav_brawler: optionalStr(formData.get('fav_brawler'), 40),
    brawler_type: optionalStr(formData.get('brawler_type'), 40),
    fav_mode: optionalStr(formData.get('fav_mode'), 40),
    fav_food: optionalStr(formData.get('fav_food'), 60),
    fav_drink: optionalStr(formData.get('fav_drink'), 60),
    fav_skin: optionalStr(formData.get('fav_skin'), 60),
    quote: optionalStr(formData.get('quote'), 160),
  };

  // Trophées : arrondis automatiquement au palier de 100.
  const trophies = optionalInt(formData.get('trophies'));
  patch.trophies = trophies === null ? null : roundTo100(trophies);

  // Le rôle n'est modifiable que par le super-admin.
  if (session.role === 'super-admin') {
    const roleLabel = str(formData.get('role_label'), 40);
    if (roleLabel) patch.role_label = roleLabel;
  }

  const avatar = await uploadImage(formData.get('avatar') as File | null, 'avatars');
  if (avatar) patch.avatar_url = avatar;

  const emote = await uploadImage(formData.get('emote') as File | null, 'emotes');
  if (emote) patch.emote_url = emote;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('roster')
    .upsert(patch, { onConflict: 'username' });
  if (error) throw new Error(error.message);
  revalidatePath('/');
}
