import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,   // 5 minutes — no re-fetch within this window
      gcTime: 60 * 60 * 1000,     // 1 hour — keep cache in memory between navigations
    },
  },
});

export default function RootLayout() {
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
