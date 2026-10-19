import { create } from 'zustand';
import { authClient } from '@/utils/auth-client';
import { queryClient } from '@/app/_layout';
import api from '@/utils/api';

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export interface AppUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface AppSession {
  id: string;
  userId: string;
  token?: string;
  expiresAt?: Date | string;
}

interface AuthState {
  session: AppSession | null;
  user: AppUser | null;
  loading: boolean;
  initialized: boolean;

  /** Initialize auth — call once on app start. */
  initialize: () => Promise<void>;

  /** Sign up with email + password. */
  signUp: (email: string, password: string, name?: string) => Promise<void>;

  /** Sign in with email + password. */
  signIn: (email: string, password: string) => Promise<void>;

  /** Sign out the current user. */
  signOut: () => Promise<void>;
}

/* ──────────────────────────────────────────────────────────
 * Store
 * ────────────────────────────────────────────────────────── */

export const useAuthStore = create<AuthState>((set) => {
  /**
   * Sync the authenticated user to Neon via our backend.
   * Logs errors to console but doesn't block the auth flow.
   */
  const syncUserToBackend = async () => {
    try {
      console.log('[Auth] Syncing user to backend...');
      const res = await api.get('/user/me');
      console.log('[Auth] User synced to Neon ✅', res.data?.data?.id);
    } catch (err: any) {
      console.error('[Auth] ❌ Backend sync failed:', err?.response?.status, err?.response?.data || err?.message);
    }
  };

  /**
   * Clear all user-specific local data.
   * Called on sign-out to prevent stale data when switching accounts.
   */
  const clearLocalUserData = async () => {
    queryClient.clear();
  };

  return {
    session: null,
    user: null,
    loading: false,
    initialized: false,

    initialize: async () => {
      try {
        const { data, error } = await authClient.getSession();

        if (error || !data?.session || !data?.user) {
          await clearLocalUserData();
          set({ session: null, user: null, initialized: true });
          return;
        }

        set({
          session: data.session as unknown as AppSession,
          user: data.user as unknown as AppUser,
          initialized: true,
        });

        // Ensure the user exists in Neon on app startup
        await syncUserToBackend();
      } catch {
        set({ session: null, user: null, initialized: true });
      }
    },

    signUp: async (email, password, name) => {
      set({ loading: true });
      try {
        await clearLocalUserData();

        const res = await authClient.signUp.email({
          email,
          password,
          name: name || email.split('@')[0],
        });

        if (res.error) {
          throw new Error(res.error.message || 'Sign up failed');
        }

        const sessionRes = await authClient.getSession();
        const session = (sessionRes.data?.session ?? (res.data as any)?.session) as unknown as AppSession;
        const user = (sessionRes.data?.user ?? (res.data as any)?.user) as unknown as AppUser;

        set({ session, user });
        await syncUserToBackend();
      } finally {
        set({ loading: false });
      }
    },

    signIn: async (email, password) => {
      set({ loading: true });
      try {
        await clearLocalUserData();

        const res = await authClient.signIn.email({
          email,
          password,
        });

        if (res.error) {
          throw new Error(res.error.message || 'Invalid email or password');
        }

        const sessionRes = await authClient.getSession();
        const session = (sessionRes.data?.session ?? (res.data as any)?.session) as unknown as AppSession;
        const user = (sessionRes.data?.user ?? (res.data as any)?.user) as unknown as AppUser;

        set({ session, user });
        await syncUserToBackend();
      } finally {
        set({ loading: false });
      }
    },

    signOut: async () => {
      set({ loading: true });
      try {
        await authClient.signOut();
        await clearLocalUserData();
        set({ session: null, user: null });
      } finally {
        set({ loading: false });
      }
    },
  };
});
