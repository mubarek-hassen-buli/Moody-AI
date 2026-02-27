import { Stack } from "expo-router";

/**
 * Auth group layout.
 *
 * Wraps onboarding, login, and signup in a headerless stack so we
 * control the navigation chrome ourselves in each screen.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "transparent" },
      }}
    />
  );
}
