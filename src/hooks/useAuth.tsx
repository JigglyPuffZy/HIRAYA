import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '@/services/authService';
import { supabaseProfileService } from '@/services/supabase/profileService';
import { supabase } from '@/lib/supabase';
import {
  AuthCredentials,
  AuthSession,
  RegisterPayload,
  User,
} from '@/types/auth';
import { ApiError } from '@/types/api';

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<AuthSession>;
  register: (payload: RegisterPayload) => Promise<AuthSession>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const stored = await authService.getStoredSession();
    setSession(stored);
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const stored = await authService.getStoredSession();
        if (mounted) {
          setSession(stored);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) {
        return;
      }

      if (nextSession) {
        const mapped = {
          token: nextSession.access_token,
          user: {
            id: nextSession.user.id,
            email: nextSession.user.email ?? '',
            fullName:
              (nextSession.user.user_metadata?.full_name as string | undefined) ??
              '',
            createdAt: nextSession.user.created_at,
          },
        };

        setSession(mapped);

        void supabaseProfileService.fetchRemoteProfile(mapped.user.id).then((remote) => {
          if (!mounted || !remote) {
            return;
          }

          setSession((current) => {
            if (!current || current.user.id !== mapped.user.id) {
              return current;
            }

            return {
              ...current,
              user: {
                ...current.user,
                fullName: remote.fullName || current.user.fullName,
                email: remote.email || current.user.email,
              },
            };
          });
        });
      } else {
        setSession(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: AuthCredentials) => {
    setError(null);
    try {
      const nextSession = await authService.login(credentials);
      setSession(nextSession);
      return nextSession;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Unable to sign in';
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setError(null);
    try {
      const nextSession = await authService.register(payload);
      setSession(nextSession);
      return nextSession;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Unable to create account';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setSession(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isAuthenticated: session !== null,
      error,
      login,
      register,
      logout,
      refreshSession,
      clearError,
    }),
    [
      session,
      isLoading,
      error,
      login,
      register,
      logout,
      refreshSession,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useCurrentUser(): User | null {
  const { session } = useAuth();
  return session?.user ?? null;
}
