import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/hooks/useAuth";
import { Colors } from "@/constants/colors";
import { FontSize, Typography } from "@/constants/typography";

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

/** Maximum time to wait for session before falling back */
const AUTH_TIMEOUT_MS = 8_000;

/* ──────────────────────────────────────────────────────────
 * Auth callback screen
 *
 * Handles the `moody://auth/callback` deep link that Supabase
 * redirects to after Google OAuth.
 *
 * This screen is a **safety net**. The primary auth handling
 * happens in `useGoogleAuth`, which extracts tokens from the
 * URL and updates both Supabase and the Zustand auth store.
 *
 * This screen simply watches the Zustand store:
 * - When `session` becomes available → navigate to /(tabs)
 * - If nothing happens within the timeout → fall back to /
 *
 * Why watch Zustand instead of Supabase?
 * Because `(tabs)/_layout.tsx` checks the Zustand store.
 * Navigating before Zustand updates causes a redirect loop
 * back to onboarding.
 * ────────────────────────────────────────────────────────── */

export default function AuthCallbackScreen() {
  const router = useRouter();
  const hasNavigated = useRef(false);
  const session = useAuthStore((s) => s.session);

  /* ── Navigate when session appears in Zustand ─────────── */
  useEffect(() => {
    if (session && !hasNavigated.current) {
      hasNavigated.current = true;
      router.replace("/(tabs)" as any);
    }
  }, [session, router]);

  /* ── Timeout fallback ─────────────────────────────────── */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        router.replace("/");
      }
    }, AUTH_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  text: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
  },
});
