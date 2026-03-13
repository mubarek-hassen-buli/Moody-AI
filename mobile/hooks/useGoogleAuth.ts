import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/utils/supabase';
import { queryClient } from '@/app/_layout';

/* ──────────────────────────────────────────────────────────
 * Ensure the browser auth session is properly dismissed
 * when returning to the app.
 * ────────────────────────────────────────────────────────── */

WebBrowser.maybeCompleteAuthSession();

/* ──────────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────────── */

/**
 * useGoogleAuth
 *
 * Handles Google OAuth sign-in via Supabase's built-in
 * OAuth flow and Expo AuthSession.
 *
 * Flow:
 * 1. Generate a redirect URI using the app's scheme (`moody://`)
 * 2. Call `supabase.auth.signInWithOAuth` with the redirect URI
 * 3. Open the Supabase-hosted Google consent screen in a browser
 * 4. On redirect back, extract the session tokens from the URL
 * 5. Set the Supabase session manually
 */
export function useGoogleAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      /* ── 1. Build the redirect URI ──────────────────── */
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'moody',
        path: 'auth/callback',
      });

      /* ── 2. Get the OAuth URL from Supabase ─────────── */
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        throw new Error(error?.message ?? 'Failed to start Google sign-in.');
      }

      /* ── 3. Open Google consent screen ──────────────── */
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
      );

      if (result.type !== 'success' || !result.url) {
        // User cancelled or browser dismissed — not an error
        return;
      }

      /* ── 4. Extract tokens from the redirect URL ────── */
      const url = new URL(result.url);

      // Supabase returns tokens in the URL fragment (#access_token=...&refresh_token=...)
      const params = new URLSearchParams(
        url.hash.startsWith('#') ? url.hash.substring(1) : url.hash,
      );

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        throw new Error('Missing auth tokens from Google sign-in.');
      }

      /* ── 5. Set the Supabase session ────────────────── */
      // Clear stale data from any previous account
      queryClient.clear();

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        throw sessionError;
      }

      /* ── 6. Navigate to home ────────────────────────── */
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      console.error('[GoogleAuth] ❌', err?.message);
      Alert.alert(
        'Google Sign-In Failed',
        err?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { signInWithGoogle, loading };
}
