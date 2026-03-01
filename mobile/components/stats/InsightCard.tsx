import React, { useMemo } from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { FontSize, FontWeight, Typography } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";
import type { WeeklyDay, MoodStats } from "@/hooks/useMood";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface InsightCardProps {
  style?: ViewStyle;
  weeklyData?: WeeklyDay[];
  statsData?: MoodStats | null;
  loading?: boolean;
}

interface ComputedInsight {
  id: string;
  emoji: string;
  title: string;
  description: string;
  progress: number; // 0 to 1
}

/* ──────────────────────────────────────────────────────────
 * Logic
 * ────────────────────────────────────────────────────────── */

function computeInsights(
  weeklyData?: WeeklyDay[],
  statsData?: MoodStats | null
): ComputedInsight[] {
  const insights: ComputedInsight[] = [];

  if (!weeklyData || weeklyData.length === 0) {
    return insights;
  }

  // 1. Logging streak
  let currentStreak = 0;
  for (let i = weeklyData.length - 1; i >= 0; i--) {
    if (weeklyData[i].score !== null) {
      currentStreak++;
    } else {
      break; // break on first empty day
    }
  }

  if (currentStreak > 0) {
    insights.push({
      id: "streak",
      emoji: "🔥",
      title: "Logging Streak",
      description: `You've tracked your mood ${currentStreak} day${currentStreak > 1 ? "s" : ""} in a row!`,
      progress: Math.min(currentStreak / 7, 1),
    });
  }

  // 2. Average Mood Score
  const loggedDays = weeklyData.filter((d) => d.score !== null);
  if (loggedDays.length > 0) {
    const sum = loggedDays.reduce((acc, d) => acc + (d.score ?? 0), 0);
    const avg = sum / loggedDays.length;
    
    let emoji = "🙂";
    let title = "Stable Week";
    let desc = "Your mood was mostly okay this week.";

    if (avg >= 4) {
      emoji = "🌟";
      title = "Excellent Week";
      desc = "You've had a highly positive week overall!";
    } else if (avg <= 2) {
      emoji = "🫂";
      title = "Tough Week";
      desc = "It's been a tough week. Remember to be kind to yourself.";
    }

    insights.push({
      id: "average",
      emoji,
      title,
      description: desc,
      progress: (avg - 1) / 4, // 1-5 maps to 0-1
    });
  }

  // 3. Dominant Emotion (from stats)
  if (statsData && statsData.breakdown && statsData.breakdown.length > 0) {
    // Breakdown is sorted by percentage descending
    const dominant = statsData.breakdown[0];
    if (dominant.percentage > 40) {
      insights.push({
        id: "dominant",
        emoji: "📊",
        title: "Dominant Emotion",
        description: `Your most frequent emotion historically is ${dominant.label.toLowerCase()} (${Math.round(dominant.percentage)}%).`,
        progress: dominant.percentage / 100,
      });
    }
  }

  return insights;
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const InsightCard: React.FC<InsightCardProps> = ({ style, weeklyData, statsData, loading }) => {
  const insights = useMemo(() => computeInsights(weeklyData, statsData), [weeklyData, statsData]);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Recovery insights</Text>
      <Text style={styles.subtitle}>
        Highlights and patterns from your data
      </Text>

      {loading && !insights.length && (
        <Text style={styles.emptyText}>Analyzing data…</Text>
      )}

      {!loading && insights.length === 0 && (
        <Text style={styles.emptyText}>Log more moods to see insights.</Text>
      )}

      {insights.map((insight) => (
        <View key={insight.id} style={styles.insightRow}>
          <Text style={styles.emoji}>{insight.emoji}</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDesc}>{insight.description}</Text>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${insight.progress * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.base,
    fontFamily: Typography.fontFamily,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: "center",
    paddingVertical: Spacing.xl,
    fontFamily: Typography.fontFamily,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.base,
  },
  emoji: {
    fontSize: 26,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
    fontFamily: Typography.fontFamily,
  },
  insightDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
});
