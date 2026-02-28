import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
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

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
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
      set({ initialized: true });
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
}));
