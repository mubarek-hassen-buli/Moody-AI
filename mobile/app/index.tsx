import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/hooks/useAuth";
import { Colors } from "@/constants/colors";

/**
 * App entry point.
 *
 * Checks for an existing Supabase session:
 * - If authenticated → redirect to the main tab navigator.
 * - If not → redirect to onboarding.
 */
export default function Index() {
  const { session, initialized, initialize } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initialize().finally(() => setReady(true));
  }, []);

  // Show a loading spinner while checking session
  if (!ready || !initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (session) {
    return <Redirect href={"/(tabs)" as any} />;
  }

  return <Redirect href="/(auth)/onboarding" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
});
