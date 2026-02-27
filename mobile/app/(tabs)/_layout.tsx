import React from "react";
import { StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Tab Icons
 * ────────────────────────────────────────────────────────── */

const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V9.5z"
      fill={color}
    />
  </Svg>
);

const JournalIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M8 7h8M8 11h8M8 15h5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const StatsIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="13" width="4" height="8" rx="1" fill={color} />
    <Rect x="10" y="8" width="4" height="13" rx="1" fill={color} />
    <Rect x="16" y="3" width="4" height="18" rx="1" fill={color} />
  </Svg>
);

const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" fill={color} />
    <Path
      d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Layout
 * ────────────────────────────────────────────────────────── */

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: FontWeight.medium,
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          bottom: insets.bottom > 0 ? insets.bottom : Spacing.md,
          left: Spacing.xl,
          right: Spacing.xl,
          height: 64,
          borderRadius: BorderRadius.pill,
          backgroundColor: Colors.textPrimary,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          paddingBottom: Spacing.sm,
          paddingTop: Spacing.sm,
        },
        tabBarItemStyle: {
          borderRadius: BorderRadius.pill,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Journal",
          tabBarIcon: ({ color }) => <JournalIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => <StatsIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <ProfileIcon color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
