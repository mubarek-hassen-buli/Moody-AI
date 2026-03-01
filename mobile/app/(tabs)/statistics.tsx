import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MoodChart } from "@/components/stats/MoodChart";
import { EmotionBreakdown } from "@/components/stats/EmotionBreakdown";
import { InsightCard } from "@/components/stats/InsightCard";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Spacing, SCREEN_PADDING } from "@/constants/spacing";
import { useWeeklyMoods, useMoodStats } from "@/hooks/useMood";

import { useDataStore } from "@/stores/useDataStore";

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();

  // Zustand: instant synchronous data from last successful fetch
  const cachedWeekly = useDataStore((s) => s.weeklyMoods);
  const cachedStats = useDataStore((s) => s.moodStats);

  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyMoods();
  const { data: statsData, isLoading: statsLoading } = useMoodStats();

  // Show Zustand cache while TanStack re-validates in the background.
  // Spinner only appears if both TanStack is loading AND Zustand is empty
  // (i.e. the very first launch before any data has ever been fetched).
  const displayWeekly = weeklyData ?? (cachedWeekly.length > 0 ? cachedWeekly : undefined);
  const displayStats = statsData ?? (cachedStats ?? undefined);
  const displayWeeklyLoading = weeklyLoading && !displayWeekly;
  const displayStatsLoading = statsLoading && !displayStats;


  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page Header ─────────────────────────────────── */}
        <Text style={styles.heading}>Statistics</Text>
        <Text style={styles.subtitle}>Your weekly emotional wellness overview</Text>

        {/* ── Mood Line Chart ─────────────────────────────── */}
        <MoodChart
          style={styles.card}
          data={displayWeekly}
          loading={displayWeeklyLoading}
        />

        {/* ── Emotion Donut Breakdown ─────────────────────── */}
        <EmotionBreakdown
          style={styles.card}
          data={displayStats?.breakdown}
          loading={displayStatsLoading}
        />

        {/* ── Recovery Insights ───────────────────────────── */}
        <InsightCard style={styles.card} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
  },
  heading: {
    ...Typography.hero,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  card: {
    marginBottom: Spacing.base,
  },
});
