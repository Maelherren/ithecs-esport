import 'server-only';

// Petits utilitaires de validation/parsing côté serveur.

export function str(v: FormDataEntryValue | null, max = 2000): string {
  return String(v ?? '').trim().slice(0, max);
}

export function optionalStr(v: FormDataEntryValue | null, max = 2000): string | null {
  const s = str(v, max);
  return s.length ? s : null;
}

export function optionalTime(v: FormDataEntryValue | null): string | null {
  const s = str(v, 8);
  return /^\d{2}:\d{2}(:\d{2})?$/.test(s) ? s : null;
}

export function requireDate(v: FormDataEntryValue | null): string {
  const s = str(v, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    throw new Error('Date invalide.');
  }
  return s;
}

export function optionalInt(v: FormDataEntryValue | null): number | null {
  const s = str(v, 12);
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

export function intOr(v: FormDataEntryValue | null, fallback = 0): number {
  const n = optionalInt(v);
  return n === null ? fallback : Math.max(0, n);
}
