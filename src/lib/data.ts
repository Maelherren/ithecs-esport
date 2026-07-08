import { createPublicClient } from './supabase/public';
import type {
  Article,
  Availability,
  MatcherinoEvent,
  MatcherinoResponse,
  MatchResult,
  RosterMember,
  ScrimEvent,
  ScrimResponse,
} from './types';

// Toutes les lectures utilisent la clé anon (RLS: SELECT public).
// Ces fonctions sont appelées depuis des Server Components.

export async function getMatcherinoEvents(): Promise<MatcherinoEvent[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('matcherino_events')
    .select('*')
    .order('date', { ascending: true })
    .order('match_time', { ascending: true, nullsFirst: true });
  return (data as MatcherinoEvent[]) ?? [];
}

export async function getMatcherinoResponses(): Promise<MatcherinoResponse[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from('matcherino_responses').select('*');
  return (data as MatcherinoResponse[]) ?? [];
}

export async function getScrimEvents(): Promise<ScrimEvent[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('scrim_events')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true, nullsFirst: true });
  return (data as ScrimEvent[]) ?? [];
}

export async function getScrimResponses(): Promise<ScrimResponse[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from('scrim_responses').select('*');
  return (data as ScrimResponse[]) ?? [];
}

export async function getAvailability(): Promise<Availability[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from('availability').select('*');
  return (data as Availability[]) ?? [];
}

export async function getResults(): Promise<MatchResult[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('results')
    .select('*, rounds:result_rounds(*)')
    .order('date', { ascending: false });
  const results = (data as MatchResult[]) ?? [];
  // Trie les rounds par numéro pour un affichage stable.
  results.forEach((r) =>
    r.rounds?.sort((a, b) => a.round_number - b.round_number),
  );
  return results;
}

export async function getArticles(table: 'news' | 'info'): Promise<Article[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });
  return (data as Article[]) ?? [];
}

export async function getRoster(): Promise<RosterMember[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('roster')
    .select('*')
    .order('sort_order', { ascending: true });
  return (data as RosterMember[]) ?? [];
}

// --- Utilitaires de calcul des résultats (victoire/défaite, win rate) ---

// Un round est gagné si nos sets gagnés atteignent le seuil `sets_to_win`.
export function isRoundWon(sets_won: number, sets_to_win: number): boolean {
  return sets_won >= sets_to_win && sets_won > 0;
}

// Un match est une victoire si on gagne la majorité des rounds.
export function isMatchWon(result: MatchResult): boolean {
  const wonRounds = result.rounds?.filter((r) =>
    isRoundWon(r.sets_won, r.sets_to_win),
  ).length ?? 0;
  const total = result.rounds?.length ?? 0;
  return total > 0 && wonRounds > total / 2;
}

export function computeStats(results: MatchResult[]) {
  let wins = 0;
  let losses = 0;
  for (const r of results) {
    if ((r.rounds?.length ?? 0) === 0) continue;
    if (isMatchWon(r)) wins += 1;
    else losses += 1;
  }
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  return { wins, losses, total, winRate };
}
