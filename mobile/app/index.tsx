import { Redirect } from "expo-router";

/**
 * App entry point.
 *
 * Immediately redirects to the onboarding flow. Once backend auth is
 * integrated, this can check the session and redirect accordingly
 * (e.g. authenticated users go to the main tab navigator).
 */
export default function Index() {
  // TODO: check auth state and redirect to /(tabs) if authenticated
  return <Redirect href="/(auth)/onboarding" />;
}
