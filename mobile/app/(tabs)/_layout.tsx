import React from "react";
import { StyleSheet, View } from "react-native";
import { Tabs, Redirect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useAuthStore } from "@/hooks/useAuth";

import { CustomTabBar } from "@/components/navigation/TabBar";

/* ──────────────────────────────────────────────────────────
 * Layout
 * ────────────────────────────────────────────────────────── */

export default function TabsLayout() {
  const session = useAuthStore((s) => s.session);

  // If the user signed out, redirect to onboarding immediately
  if (!session) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="journal" />
      <Tabs.Screen name="statistics" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

