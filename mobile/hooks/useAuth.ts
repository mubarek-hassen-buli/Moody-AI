import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import api from '@/utils/api';
import type { Session, User } from '@supabase/supabase-js';

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface AuthState {
  session: Session | null;
  user: User | null;
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
   * Silently fails — auth still works even if backend is down.
   */
  const syncUserToBackend = async () => {
    try {
      await api.get('/user/me');
    } catch {
      // Backend sync is best-effort; don't block auth flow
    }
  };

  return {
    session: null,
    user: null,
    loading: false,
    initialized: false,

    initialize: async () => {
      try {
        // Validate the token against Supabase server, NOT just the local cache.
        // getUser() makes a real HTTP request to verify the token is still valid.
        // If the user was deleted in Supabase, this will return an error.
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          // Token is invalid or user was deleted — clear everything
          await supabase.auth.signOut();
          set({ session: null, user: null, initialized: true });
          return;
        }

        // Token is valid, get the session for the JWT
        const { data: { session } } = await supabase.auth.getSession();
        set({
          session,
          user: session?.user ?? null,
          initialized: true,
        });

        // Listen for auth state changes (token refresh, sign out, etc.)
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null });
        });
      } catch {
        set({ session: null, user: null, initialized: true });
      }
    },

    signUp: async (email, password, name) => {
      set({ loading: true });
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (error) throw error;

        set({
          session: data.session,
          user: data.user,
        });

        await syncUserToBackend();
      } finally {
        set({ loading: false });
      }
    },

    signIn: async (email, password) => {
      set({ loading: true });
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        set({
          session: data.session,
          user: data.user,
        });

        await syncUserToBackend();
      } finally {
        set({ loading: false });
      }
    },

    signOut: async () => {
      set({ loading: true });
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({ session: null, user: null });
      } finally {
        set({ loading: false });
      }
    },
  };
});
