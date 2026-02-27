import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

/**
 * Root layout.
 *
 * Acts as the application shell. All group layouts (auth, main, etc.)
 * are nested underneath this stack.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </>
  );
}
