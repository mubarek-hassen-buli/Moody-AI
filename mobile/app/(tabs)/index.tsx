import React, { useState, useCallback } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";

import { MoodSelector } from "@/components/home/MoodSelector";
import { ActivityCard } from "@/components/home/ActivityCard";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { Spacing, SCREEN_PADDING, BorderRadius } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Inline Icons
 * ────────────────────────────────────────────────────────── */

const BellIcon: React.FC = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0"
      stroke={Colors.textPrimary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SearchIcon: React.FC = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={Colors.textTertiary} strokeWidth={2} />
    <Path
      d="M21 21l-4.35-4.35"
      stroke={Colors.textTertiary}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelect = useCallback((key: string) => {
    setSelectedMood((prev) => (prev === key ? null : key));
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.base, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>😊</Text>
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.greeting}>Hi 👋</Text>
              <Text style={styles.userName}>Friend</Text>
            </View>
          </View>
          <Pressable style={styles.bellButton} accessibilityLabel="Notifications">
            <BellIcon />
          </Pressable>
        </View>

        {/* ── Welcome Banner ─────────────────────────────── */}
        <View style={styles.banner}>
          <Text style={styles.bannerGreeting}>{getGreeting()}</Text>
          <Text style={styles.bannerTitle}>
            Welcome back,{"\n"}how's your mind{"\n"}today?
          </Text>

          {/* Search bar */}
          <Pressable style={styles.searchBar}>
            <SearchIcon />
            <Text style={styles.searchPlaceholder}>Search...</Text>
          </Pressable>
        </View>

        {/* ── Daily Mood ─────────────────────────────────── */}
        <MoodSelector
          selectedMood={selectedMood}
          onSelectMood={handleMoodSelect}
        />

        {/* ── Activities ─────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Activities</Text>
        <View style={styles.activitiesRow}>
          <ActivityCard
            title="Morning Breathing"
            subtitle="5 min guided calm"
            backgroundColor="#FFF3EC"
            style={styles.activityCardLeft}
          />
          <ActivityCard
            title="Mood Journal"
            subtitle="Reflect on your day"
            backgroundColor="#F0EBE5"
            style={styles.activityCardRight}
          />
        </View>

        {/* ── Quick Tips ─────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Quick tips</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Take a deep breath</Text>
            <Text style={styles.tipSubtitle}>
              Pause for a moment. Inhale for 4 seconds, hold for 4, exhale for 6.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 22,
  },
  headerTextBlock: {
    justifyContent: "center",
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },

  /* Banner */
  banner: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.xl,
    padding: SCREEN_PADDING,
    marginBottom: Spacing.sm,
  },
  bannerGreeting: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    opacity: 0.8,
  },
  bannerTitle: {
    ...Typography.hero,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.pill,
    height: 44,
    paddingHorizontal: Spacing.base,
    alignSelf: "flex-start",
    minWidth: 160,
  },
  searchPlaceholder: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },

  /* Sections */
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginTop: Spacing.xxl,
    marginBottom: Spacing.base,
  },

  /* Activities */
  activitiesRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  activityCardLeft: {
    marginRight: 0,
  },
  activityCardRight: {
    marginLeft: 0,
  },

  /* Tips */
  tipCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  tipEmoji: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  tipSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
