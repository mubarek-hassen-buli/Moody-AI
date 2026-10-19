import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
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
 * When `moody://auth/callback` arrives, synchronizes the Better Auth session.
 * ────────────────────────────────────────────────────────── */

function useAuthRedirectHandler() {
  const hasHandled = useRef(false);

  useEffect(() => {
    async function handleAuthUrl(url: string) {
      if (hasHandled.current) return;
      if (!url.includes('auth/callback')) return;

      hasHandled.current = true;
      console.log('[AuthRedirect] 🔑 Auth callback detected, synchronizing session…');

      try {
        await useAuthStore.getState().initialize();
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
