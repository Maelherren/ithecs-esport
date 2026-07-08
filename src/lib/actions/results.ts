'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireSuperAdmin } from '@/lib/auth';
import { requireDate, str } from './helpers';

const PATHS = ['/', '/resultats'];
function revalidate() {
  PATHS.forEach((p) => revalidatePath(p));
}

type RoundInput = {
  sets_won: number;
  sets_lost: number;
  rounds_won: number;
  rounds_lost: number;
  sets_to_win: number;
};

// Les rounds sont transmis en JSON (le client gère l'ajout/suppression dynamique).
function parseRounds(raw: string): RoundInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw || '[]');
  } catch {
    throw new Error('Rounds invalides.');
  }
  if (!Array.isArray(parsed)) throw new Error('Rounds invalides.');

  return parsed.map((r) => {
    const o = r as Record<string, unknown>;
    const clampInt = (v: unknown) => Math.max(0, Number.parseInt(String(v ?? 0), 10) || 0);
    const stw = Number.parseInt(String(o.sets_to_win ?? 1), 10);
    return {
      sets_won: clampInt(o.sets_won),
      sets_lost: clampInt(o.sets_lost),
      rounds_won: clampInt(o.rounds_won),
      rounds_lost: clampInt(o.rounds_lost),
      sets_to_win: [1, 2, 3].includes(stw) ? stw : 1,
    };
  });
}

async function saveRounds(resultId: string, rounds: RoundInput[]) {
  const supabase = createAdminClient();
  // Remplace tous les rounds existants.
  await supabase.from('result_rounds').delete().eq('result_id', resultId);
  if (rounds.length === 0) return;
  const rows = rounds.map((r, i) => ({
    result_id: resultId,
    round_number: i + 1,
    ...r,
  }));
  const { error } = await supabase.from('result_rounds').insert(rows);
  if (error) throw new Error(error.message);
}

export async function createResult(formData: FormData) {
  await requireSuperAdmin();
  const name = str(formData.get('name'), 200);
  if (!name) throw new Error('Le nom est requis.');
  const rounds = parseRounds(str(formData.get('rounds_json'), 20000));

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('results')
    .insert({ name, date: requireDate(formData.get('date')) })
    .select('id')
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Erreur de création.');

  await saveRounds(data.id, rounds);
  revalidate();
}

export async function updateResult(formData: FormData) {
  await requireSuperAdmin();
  const id = str(formData.get('id'), 40);
  const name = str(formData.get('name'), 200);
  if (!id || !name) throw new Error('Données invalides.');
  const rounds = parseRounds(str(formData.get('rounds_json'), 20000));

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('results')
    .update({ name, date: requireDate(formData.get('date')) })
    .eq('id', id);
  if (error) throw new Error(error.message);

  await saveRounds(id, rounds);
  revalidate();
}

export async function deleteResult(formData: FormData) {
  await requireSuperAdmin();
  const id = str(formData.get('id'), 40);
  if (!id) throw new Error('Identifiant manquant.');

  const supabase = createAdminClient();
  const { error } = await supabase.from('results').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidate();
}
