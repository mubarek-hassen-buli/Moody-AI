import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import { supabase } from "@/utils/supabase";
import { useAuthStore } from "@/hooks/useAuth";

/* ──────────────────────────────────────────────────────────
 * Query client
 *
 * staleTime: data served from cache within this window, no re-fetch.
 * gcTime: how long unused cache stays in memory between navigations.
 *
 * Combined with the Zustand data store (useDataStore), screens get
 * instant synchronous data from Zustand and background re-validation
 * from TanStack — no loading spinners on tab switches.
 *
 * NOTE: Disk persistence via AsyncStorage is not used because the
 * legacy AsyncStorage native module is incompatible with the new
 * React Native architecture (Fabric) used in Expo SDK 54.
 * ────────────────────────────────────────────────────────── */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,   // 5 minutes — no re-fetch within this window
      gcTime: 60 * 60 * 1000,     // 1 hour — keep cache in memory between navigations
    },
  },
});

/* ──────────────────────────────────────────────────────────
 * Global auth redirect handler
 *
 * Listens for deep links at the ROOT level of the app.
 * When `moody://auth/callback#access_token=...` arrives,
 * extracts tokens and sets the Supabase session.
 *
 * This is the authoritative handler — it runs at the
 * highest level and catches URLs that useGoogleAuth
 * might miss (e.g. on Android where openAuthSessionAsync
 * returns "dismiss").
 *
 * The onAuthStateChange listener in useAuth.ts will then
 * update the Zustand store, which triggers the callback
 * screen to navigate to /(tabs).
 * ────────────────────────────────────────────────────────── */

function useAuthRedirectHandler() {
  const hasHandled = useRef(false);

  useEffect(() => {
    /** Extract tokens from the URL and set the Supabase session. */
    async function handleAuthUrl(url: string) {
      if (hasHandled.current) return;
      if (!url.includes('auth/callback')) return;

      const hashIndex = url.indexOf('#');
      if (hashIndex === -1) return;

      const fragment = url.substring(hashIndex + 1);
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) return;

      hasHandled.current = true;
      console.log('[AuthRedirect] 🔑 Tokens found in deep link, setting session…');

      try {
        queryClient.clear();
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('[AuthRedirect] ❌ setSession failed:', error.message);
          return;
        }

        // Directly update Zustand as a safety net
        if (data.session) {
          useAuthStore.setState({
            session: data.session,
            user: data.session.user,
          });
          console.log('[AuthRedirect] ✅ Session set, Zustand updated');
        }
      } catch (err: any) {
        console.error('[AuthRedirect] ❌ Error:', err?.message);
      }
    }

    // Cold start: check if the app was opened by a deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleAuthUrl(url);
    });

    // Warm start: listen for new incoming deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleAuthUrl(url);
    });

    return () => subscription.remove();
  }, []);
}

/* ──────────────────────────────────────────────────────────
 * Root Layout
 * ────────────────────────────────────────────────────────── */

export default function RootLayout() {
  // Global auth redirect handler — always active
  useAuthRedirectHandler();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </QueryClientProvider>
  );
}
