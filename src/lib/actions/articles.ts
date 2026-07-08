'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireSuperAdmin } from '@/lib/auth';
import { optionalStr, str } from './helpers';
import { uploadImage } from './upload';

type Table = 'news' | 'info';

function pathFor(table: Table): string {
  return table === 'news' ? '/actualite' : '/information';
}

async function createArticle(table: Table, formData: FormData) {
  await requireSuperAdmin();
  const title = str(formData.get('title'), 200);
  if (!title) throw new Error('Le titre est requis.');
  const content = optionalStr(formData.get('content'), 20000) ?? '';
  const image_url = await uploadImage(formData.get('image') as File | null, table);

  const supabase = createAdminClient();
  const { error } = await supabase.from(table).insert({ title, content, image_url });
  if (error) throw new Error(error.message);
  revalidatePath(pathFor(table));
  revalidatePath('/');
}

async function updateArticle(table: Table, formData: FormData) {
  await requireSuperAdmin();
  const id = str(formData.get('id'), 40);
  const title = str(formData.get('title'), 200);
  if (!id || !title) throw new Error('Données invalides.');
  const content = optionalStr(formData.get('content'), 20000) ?? '';

  const patch: Record<string, unknown> = {
    title,
    content,
    updated_at: new Date().toISOString(),
  };
  const newImage = await uploadImage(formData.get('image') as File | null, table);
  if (newImage) patch.image_url = newImage;

  const supabase = createAdminClient();
  const { error } = await supabase.from(table).update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(pathFor(table));
  revalidatePath('/');
}

async function deleteArticle(table: Table, formData: FormData) {
  await requireSuperAdmin();
  const id = str(formData.get('id'), 40);
  if (!id) throw new Error('Identifiant manquant.');
  const supabase = createAdminClient();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath(pathFor(table));
  revalidatePath('/');
}

// --- Actualité ---
export async function createNews(formData: FormData) {
  await createArticle('news', formData);
}
export async function updateNews(formData: FormData) {
  await updateArticle('news', formData);
}
export async function deleteNews(formData: FormData) {
  await deleteArticle('news', formData);
}

// --- Information ---
export async function createInfo(formData: FormData) {
  await createArticle('info', formData);
}
export async function updateInfo(formData: FormData) {
  await updateArticle('info', formData);
}
export async function deleteInfo(formData: FormData) {
  await deleteArticle('info', formData);
}
