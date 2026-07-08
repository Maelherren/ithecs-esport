// Types partagés de l'application ITHECS

export type Role = 'super-admin' | 'admin';

export type SessionUser = {
  username: string;
  role: Role;
};

export const ADMIN_USERNAMES = ['chatax', 'shurtugal', 'etna', 'orby'] as const;

// Noms d'affichage des 4 membres (clé = username en minuscules).
export const ADMIN_DISPLAY: Record<string, string> = {
  chatax: 'Chatax',
  shurtugal: "Shurt'ugal",
  etna: 'Etna',
  orby: 'Orby',
};

export function displayName(username: string): string {
  return ADMIN_DISPLAY[username.toLowerCase()] ?? username;
}

export type MatcherinoEvent = {
  id: string;
  name: string;
  date: string;
  match_time: string | null;
  rdv_time: string | null;
  checkin_time: string | null;
  queue_position: number | null;
  queue_max: number | null;
  matcherino_link: string | null;
  created_at: string;
};

export type MatcherinoStatus = 'present' | 'absent' | 'uncertain';
export type ScrimStatus = 'present' | 'absent';
export type AvailabilityStatus = 'available' | 'unavailable';

export type MatcherinoResponse = {
  id: string;
  event_id: string;
  username: string;
  status: MatcherinoStatus;
  updated_at: string;
};

export type ScrimEvent = {
  id: string;
  date: string;
  time: string | null;
  opponent: string | null;
  notes: string | null;
  created_at: string;
};

export type ScrimResponse = {
  id: string;
  event_id: string;
  username: string;
  status: ScrimStatus;
  updated_at: string;
};

export type Availability = {
  id: string;
  username: string;
  date: string;
  status: AvailabilityStatus;
  updated_at: string;
};

export type ResultRound = {
  id: string;
  result_id: string;
  round_number: number;
  sets_won: number;
  sets_lost: number;
  rounds_won: number;
  rounds_lost: number;
  sets_to_win: number;
  comment: string | null;
};

export type MatchResult = {
  id: string;
  name: string;
  date: string;
  created_at: string;
  rounds: ResultRound[];
};

export type Article = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type RosterMember = {
  id: string;
  username: string;
  display_name: string;
  role_label: string;
  avatar_url: string | null;
  sort_order: number;
  updated_at: string;
};
