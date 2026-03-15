import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "@/utils/supabase";
import { queryClient } from "@/app/_layout";
import { Colors } from "@/constants/colors";
import { FontSize, Typography } from "@/constants/typography";

/**
 * Auth callback screen.
 *
 * Handles the `moody://auth/callback` deep link that Supabase
 * redirects to after Google OAuth.
 *
 * Flow:
 * 1. The app is opened via the deep link with tokens in the URL fragment
 * 2. This screen extracts access_token + refresh_token from the URL
 * 3. Sets the Supabase session
 * 4. Navigates to `/(tabs)`
 *
 * This ensures the user always lands on the home screen — even if
 * the `useGoogleAuth` hook already processed the tokens, this
 * screen acts as a safety net.
 */
export default function AuthCallbackScreen() {
  const router = useRouter();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      // Get the full URL that opened this screen
      const url = await Linking.getInitialURL();

      if (url) {
        // Tokens are in the URL fragment: #access_token=...&refresh_token=...
        const hashIndex = url.indexOf("#");
        if (hashIndex !== -1) {
          const fragment = url.substring(hashIndex + 1);
          const params = new URLSearchParams(fragment);

          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");

          if (accessToken && refreshToken) {
            // Clear stale data from any previous account
            queryClient.clear();

            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          }
        }
      }

      // Always navigate to home — if tokens were already set by
      // useGoogleAuth, the session is valid and index.tsx will
      // redirect to (tabs) anyway.
      router.replace("/(tabs)" as any);
    } catch (error) {
      console.error("[AuthCallback] ❌ Error processing callback:", error);
      // Fall back to the index screen which will route appropriately
      router.replace("/");
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>Signing you in…</Text>
    </View>
  );
}

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
