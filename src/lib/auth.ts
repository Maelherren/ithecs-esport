import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import type { Role, SessionUser } from './types';

const COOKIE_NAME = 'ithecs_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'AUTH_SECRET manquant ou trop court. Définis-le dans .env.local (chaîne aléatoire longue).',
    );
  }
  return new TextEncoder().encode(secret);
}

// Crée le JWT signé et le pose dans un cookie httpOnly sécurisé.
export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({ username: user.username, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function destroySession(): void {
  cookies().delete(COOKIE_NAME);
}

// Lit et vérifie la session. Retourne null si absente ou invalide.
export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const username = payload.username as string | undefined;
    const role = payload.role as Role | undefined;
    if (!username || !role) return null;
    return { username, role };
  } catch {
    return null;
  }
}

// Garde-fous pour les Server Actions. Lèvent une erreur si non autorisé.
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error('Non authentifié.');
  if (session.role !== 'admin' && session.role !== 'super-admin') {
    throw new Error('Accès réservé aux admins.');
  }
  return session;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session || session.role !== 'super-admin') {
    throw new Error('Accès réservé au super-admin.');
  }
  return session;
}
