import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { FontSize, Typography } from "@/constants/typography";

/**
 * Auth callback screen.
 *
 * This route handles the `moody://auth/callback` deep link
 * that Supabase redirects to after Google OAuth.
 *
 * It shows a loading spinner while `useGoogleAuth` extracts the
 * tokens from the URL and sets the session. The user is then
 * navigated to `/(tabs)` by the hook.
 */
export default function AuthCallbackScreen() {
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
