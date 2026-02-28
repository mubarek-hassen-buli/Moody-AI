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

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyMoods();
  const { data: statsData, isLoading: statsLoading } = useMoodStats();

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
          data={weeklyData}
          loading={weeklyLoading}
        />

        {/* ── Emotion Donut Breakdown ─────────────────────── */}
        <EmotionBreakdown
          style={styles.card}
          data={statsData?.breakdown}
          loading={statsLoading}
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
