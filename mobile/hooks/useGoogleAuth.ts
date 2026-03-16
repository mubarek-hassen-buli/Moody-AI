import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/utils/supabase';
import { queryClient } from '@/app/_layout';
import { useAuthStore } from '@/hooks/useAuth';
import api from '@/utils/api';

/* ──────────────────────────────────────────────────────────
 * Ensure the browser auth session is properly dismissed
 * when returning to the app.
 * ────────────────────────────────────────────────────────── */

WebBrowser.maybeCompleteAuthSession();

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

/**
 * Extract access_token and refresh_token from a redirect URL.
 * Supabase puts them in the hash fragment: #access_token=...&refresh_token=...
 *
 * Returns null if the URL doesn't contain valid tokens.
 */
function extractTokensFromUrl(url: string): {
  accessToken: string;
  refreshToken: string;
} | null {
  try {
    const hashIndex = url.indexOf('#');
    if (hashIndex === -1) return null;

    const fragment = url.substring(hashIndex + 1);
    const params = new URLSearchParams(fragment);

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) return null;

    return { accessToken, refreshToken };
  } catch {
    return null;
  }
}

/**
 * Set the Supabase session from tokens and update the Zustand auth
 * store **synchronously** before any navigation occurs.
 *
 * This is crucial because `(tabs)/_layout.tsx` checks the Zustand
 * store for `session`. If we navigate before Zustand updates, the
 * layout guard redirects to onboarding.
 */
async function setSessionAndUpdateStore(
  accessToken: string,
  refreshToken: string,
): Promise<boolean> {
  try {
    // Clear stale data from any previous account
    queryClient.clear();

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      console.error('[GoogleAuth] ❌ setSession failed:', error?.message);
      return false;
    }

    // Update Zustand store DIRECTLY so the tabs layout guard
    // sees the session immediately when we navigate
    useAuthStore.setState({
      session: data.session,
      user: data.session.user,
    });

    // Sync to backend (non-blocking)
    api.get('/user/me').catch(() => {});

    return true;
  } catch (err: any) {
    console.error('[GoogleAuth] ❌ Session setup failed:', err?.message);
    return false;
  }
}

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
 * 5. Set the Supabase session and update the Zustand store
 * 6. Navigate to home
 *
 * Android handling:
 * On Android, `openAuthSessionAsync` often returns `dismiss`
 * instead of `success` for custom scheme redirects. We handle
 * this by also listening for the incoming deep link URL via
 * `Linking.addEventListener`.
 */
export function useGoogleAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const hasHandled = useRef(false);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    hasHandled.current = false;

    // Subscription reference for cleanup
    let linkSub: { remove: () => void } | null = null;

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

      /* ── 3. Set up deep link listener (Android fallback)
       *
       * On Android, Chrome Custom Tabs may not return the
       * URL to openAuthSessionAsync. Instead, the redirect
       * fires as a deep link. We listen for it here.
       * ────────────────────────────────────────────────── */
      const deepLinkPromise = new Promise<string | null>((resolve) => {
        linkSub = Linking.addEventListener('url', ({ url }) => {
          if (url.includes('auth/callback') && !hasHandled.current) {
            resolve(url);
          }
        });

        // Timeout: if no deep link arrives within 60s, give up
        setTimeout(() => resolve(null), 60_000);
      });

      /* ── 4. Open Google consent screen ──────────────── */
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
      );

      /* ── 5a. Success path — browser returned the URL ── */
      if (result.type === 'success' && result.url && !hasHandled.current) {
        hasHandled.current = true;

        const tokens = extractTokensFromUrl(result.url);
        if (!tokens) throw new Error('Missing auth tokens from Google sign-in.');

        const success = await setSessionAndUpdateStore(
          tokens.accessToken,
          tokens.refreshToken,
        );
        if (!success) throw new Error('Failed to set session.');

        router.replace('/(tabs)' as any);
        return;
      }

      /* ── 5b. Dismiss path — wait for deep link ──────── */
      if (result.type === 'dismiss' || result.type === 'cancel') {
        // On Android, the URL arrives via deep link instead
        const deepLinkUrl = await deepLinkPromise;

        if (deepLinkUrl && !hasHandled.current) {
          hasHandled.current = true;

          const tokens = extractTokensFromUrl(deepLinkUrl);
          if (!tokens) throw new Error('Missing auth tokens from redirect.');

          const success = await setSessionAndUpdateStore(
            tokens.accessToken,
            tokens.refreshToken,
          );
          if (!success) throw new Error('Failed to set session.');

          router.replace('/(tabs)' as any);
          return;
        }

        // User genuinely cancelled — no error needed
        return;
      }
    } catch (err: any) {
      console.error('[GoogleAuth] ❌', err?.message);
      Alert.alert(
        'Google Sign-In Failed',
        err?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      // Clean up the Linking listener
      if (linkSub) {
        (linkSub as { remove: () => void }).remove();
      }
      setLoading(false);
    }
  }, [router]);

  return { signInWithGoogle, loading };
}
