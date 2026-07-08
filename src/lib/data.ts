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

// Un round est « joué » s'il a un score (sinon c'est une ligne de commentaire seul,
// score 0–0, qui n'entre pas dans les statistiques).
export function isRoundPlayed(r: { sets_won: number; sets_lost: number }): boolean {
  return r.sets_won > 0 || r.sets_lost > 0;
}

// Un match est une victoire si on gagne la majorité des rounds joués.
export function isMatchWon(result: MatchResult): boolean {
  const played = (result.rounds ?? []).filter(isRoundPlayed);
  const wonRounds = played.filter((r) =>
    isRoundWon(r.sets_won, r.sets_to_win),
  ).length;
  return played.length > 0 && wonRounds > played.length / 2;
}

export function computeStats(results: MatchResult[]) {
  let wins = 0;
  let losses = 0;
  let roundsWon = 0;
  let roundsPlayed = 0;
  for (const r of results) {
    const played = (r.rounds ?? []).filter(isRoundPlayed);
    if (played.length === 0) continue;
    for (const rd of played) {
      roundsPlayed += 1;
      if (isRoundWon(rd.sets_won, rd.sets_to_win)) roundsWon += 1;
    }
    if (isMatchWon(r)) wins += 1;
    else losses += 1;
  }
  const total = wins + losses;
  // Win rate calculé sur les rounds gagnés (Bo1/Bo3/Bo5), pas sur les matchs.
  const winRate = roundsPlayed > 0 ? Math.round((roundsWon / roundsPlayed) * 100) : 0;
  return { wins, losses, total, winRate, roundsWon, roundsPlayed };
}
