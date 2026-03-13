import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/utils/supabase';
import { queryClient } from '@/app/_layout';
import api from '@/utils/api';
import type { Session, User } from '@supabase/supabase-js';

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

/** SecureStore key used by the home screen to track today's mood */
const MOOD_DATE_KEY = 'moody_daily_mood_date';

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
    // Wipe TanStack Query cache (profiles, moods, journals, quotes, etc.)
    queryClient.clear();

    // Remove persisted mood-date so the new account can log fresh
    await SecureStore.deleteItemAsync(MOOD_DATE_KEY).catch(() => {});
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
          await clearLocalUserData();
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

        // Ensure the user exists in Neon on every app cold-start
        if (session) {
          await syncUserToBackend();
        }

        // Listen for auth state changes (token refresh, sign out, etc.)
        supabase.auth.onAuthStateChange((_event, newSession) => {
          set({ session: newSession, user: newSession?.user ?? null });
          // Re-sync on token refresh / new sign-in from another flow
          if (newSession) {
            syncUserToBackend();
          }
        });
      } catch {
        set({ session: null, user: null, initialized: true });
      }
    },

    signUp: async (email, password, name) => {
      set({ loading: true });
      try {
        // Clear leftover data from any previous account
        await clearLocalUserData();

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
        // Clear leftover data from any previous account
        await clearLocalUserData();

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

        await clearLocalUserData();
        set({ session: null, user: null });
      } finally {
        set({ loading: false });
      }
    },
  };
});

