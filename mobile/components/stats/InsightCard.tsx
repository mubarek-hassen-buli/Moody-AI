import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface InsightCardProps {
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Mock data
 * ────────────────────────────────────────────────────────── */

interface InsightItem {
  emoji: string;
  title: string;
  description: string;
  progress: number; // 0 → 1
}

const INSIGHTS: InsightItem[] = [
  {
    emoji: "🧘",
    title: "Mindfulness streak",
    description: "You've logged your mood 5 days in a row!",
    progress: 0.71,
  },
  {
    emoji: "😌",
    title: "Emotional balance",
    description: "Your mood variance decreased by 15% this week.",
    progress: 0.85,
  },
];

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const InsightCard: React.FC<InsightCardProps> = ({ style }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.title}>Recovery insights</Text>
    <Text style={styles.subtitle}>
      Highlights and patterns from your week
    </Text>

    {INSIGHTS.map((insight) => (
      <View key={insight.title} style={styles.insightRow}>
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
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.base,
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
  },
  insightDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: Spacing.sm,
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
