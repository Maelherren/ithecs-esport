// Formatage FR partagé (client + serveur).

export function formatDateFR(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Retire les secondes éventuelles d'une heure "HH:MM:SS".
export function formatTime(time: string | null): string {
  if (!time) return '';
  return time.slice(0, 5);
}

// Combine date + heure en ISO pour le countdown (heure locale).
export function toISODateTime(date: string, time: string | null): string {
  const t = time ? time.slice(0, 5) : '00:00';
  return `${date}T${t}:00`;
}

// Un événement est-il à venir (date/heure dans le futur) ?
export function isUpcoming(date: string, time: string | null): boolean {
  return new Date(toISODateTime(date, time)).getTime() > Date.now();
}
