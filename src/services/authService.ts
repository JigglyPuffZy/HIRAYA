import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import { supabaseProfileService } from '@/services/supabase/profileService';
import { storageService } from '@/services/storageService';
import {
  AuthCredentials,
  AuthResponse,
  AuthSession,
  RegisterPayload,
  User,
} from '@/types/auth';
import { ApiError } from '@/types/api';
import type { Session } from '@supabase/supabase-js';

function mapSupabaseUser(session: Session): User {
  const metadata = session.user.user_metadata ?? {};

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    fullName:
      (typeof metadata.full_name === 'string' && metadata.full_name) ||
      (typeof metadata.fullName === 'string' && metadata.fullName) ||
      '',
    createdAt: session.user.created_at,
  };
}

function mapSession(session: Session): AuthSession {
  return {
    token: session.access_token,
    user: mapSupabaseUser(session),
  };
}

function mapSupabaseError(error: { message: string }, status = 401): ApiError {
  return new ApiError(error.message, status);
}

async function enrichUserIdentity(user: User): Promise<User> {
  try {
    const remote = await supabaseProfileService.fetchRemoteProfile(user.id);
    if (!remote) {
      return user;
    }

    return {
      ...user,
      fullName: remote.fullName || user.fullName,
      email: remote.email || user.email,
    };
  } catch {
    return user;
  }
}

async function persistSession(session: Session): Promise<AuthSession> {
  const mapped = mapSession(session);
  const enriched = {
    ...mapped,
    user: await enrichUserIdentity(mapped.user),
  };
  await storageService.saveSession(enriched);
  return enriched;
}

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthSession> {
    assertSupabaseConfigured();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    if (error || !data.session) {
      const raw = error?.message ?? 'Unable to sign in.';
      if (/email not confirmed/i.test(raw)) {
        throw mapSupabaseError({
          message:
            'Confirm your email first (check inbox/spam), then sign in. Or disable Confirm email in Supabase Auth settings.',
        });
      }
      if (/invalid login credentials/i.test(raw)) {
        throw mapSupabaseError({
          message: 'Wrong email or password. If you just registered, confirm your email first.',
        });
      }
      throw mapSupabaseError(error ?? { message: raw });
    }

    return persistSession(data.session);
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    assertSupabaseConfigured();

    const { data, error } = await supabase.auth.signUp({
      email: payload.email.trim(),
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName.trim(),
        },
      },
    });

    if (error) {
      const raw = error.message;
      if (/already registered|already been registered|user already/i.test(raw)) {
        throw mapSupabaseError(
          { message: 'This email is already registered. Try signing in instead.' },
          409,
        );
      }
      throw mapSupabaseError(error, 409);
    }

    if (!data.session) {
      throw new ApiError(
        'Account created. Confirm your email (inbox/spam), then sign in. Tip: in Supabase → Authentication → Providers → Email, turn OFF “Confirm email” for easier APK testing.',
        202,
      );
    }

    return persistSession(data.session);
  },

  async getStoredSession(): Promise<AuthSession | null> {
    if (!supabase.auth) {
      return storageService.getSession();
    }

    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      await storageService.clearSession();
      return null;
    }

    const mapped = mapSession(data.session);
    const enriched = {
      ...mapped,
      user: await enrichUserIdentity(mapped.user),
    };
    await storageService.saveSession(enriched);
    return enriched;
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    await storageService.clearSession();
  },
};

export type { AuthResponse };
