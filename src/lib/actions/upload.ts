import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'media';
const MAX_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

// Upload d'une image vers Supabase Storage (bucket public "media").
// Retourne l'URL publique, ou null si aucun fichier fourni.
export async function uploadImage(
  file: File | null,
  folder: string,
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_BYTES) throw new Error('Image trop lourde (max 5 Mo).');
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Format d’image non supporté (jpg, png, webp, gif, avif).');
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = createAdminClient();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
