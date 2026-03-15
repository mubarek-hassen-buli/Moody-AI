import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "@/utils/supabase";
import { Colors } from "@/constants/colors";
import { FontSize, Typography } from "@/constants/typography";

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

/** Maximum time to wait for auth state before falling back */
const AUTH_TIMEOUT_MS = 5_000;

/* ──────────────────────────────────────────────────────────
 * Auth callback screen
 *
 * Handles the `moody://auth/callback` deep link that Supabase
 * redirects to after Google OAuth.
 *
 * This screen is a **passive listener** — it does NOT try to
 * extract tokens from the URL itself. Instead, it waits for
 * `useGoogleAuth` (which runs in the login screen) to call
 * `supabase.auth.setSession()`. Once `onAuthStateChange`
 * fires with a valid session, this screen navigates to /(tabs).
 *
 * Why passive?
 * - On warm start, `Linking.getInitialURL()` returns null
 * - The `useGoogleAuth` hook already handles token extraction
 * - Having two systems try to set the session causes races
 * ────────────────────────────────────────────────────────── */

export default function AuthCallbackScreen() {
  const router = useRouter();
  const hasNavigated = useRef(false);
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    /* ── 1. Check if session already exists ──────────────
     * useGoogleAuth may have already set the session
     * before this screen even mounted.
     * ────────────────────────────────────────────────── */
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !hasNavigated.current) {
        hasNavigated.current = true;
        router.replace("/(tabs)" as any);
        return;
      }
    });

    /* ── 2. Listen for auth state changes ────────────────
     * If useGoogleAuth hasn't finished yet, wait for the
     * SIGNED_IN event from onAuthStateChange.
     * ────────────────────────────────────────────────── */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session && !hasNavigated.current) {
          hasNavigated.current = true;
          router.replace("/(tabs)" as any);
        }
      },
    );

    /* ── 3. Timeout fallback ─────────────────────────────
     * If no session appears within the timeout, the user
     * may have cancelled or something went wrong. Send
     * them back to the start.
     * ────────────────────────────────────────────────── */
    const timeout = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        setStatus("Taking too long — redirecting…");
        router.replace("/");
      }
    }, AUTH_TIMEOUT_MS);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{status}</Text>
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
