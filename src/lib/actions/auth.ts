'use server';

import bcrypt from 'bcryptjs';
import { createAdminClient } from '@/lib/supabase/admin';
import { createSession, destroySession, getSession } from '@/lib/auth';
import type { Role, SessionUser } from '@/lib/types';

export type LoginState = { error: string | null; ok: boolean };

// Connexion : vérifie username (insensible à la casse) + mot de passe (bcrypt).
// Le mot de passe ne transite jamais en clair côté client autrement que dans
// le corps POST de la Server Action (chiffré par HTTPS), et n'est jamais stocké.
export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const rawUsername = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!rawUsername || !password) {
    return { error: 'Nom d’utilisateur et mot de passe requis.', ok: false };
  }

  const username = rawUsername.toLowerCase();
  const supabase = createAdminClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('username, password_hash, role')
    .eq('username', username)
    .maybeSingle();

  // Message générique pour ne pas révéler si le compte existe.
  const genericError = { error: 'Identifiants invalides.', ok: false };
  if (error || !user) return genericError;

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) return genericError;

  await createSession({ username: user.username, role: user.role as Role });
  return { error: null, ok: true };
}

export async function logoutAction(): Promise<void> {
  destroySession();
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}
