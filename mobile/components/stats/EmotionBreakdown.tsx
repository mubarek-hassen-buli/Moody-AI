import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import Svg, { Circle as SvgCircle, G } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface EmotionSegment {
  label: string;
  percentage: number;
  color: string;
}

interface EmotionBreakdownProps {
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Mock data
 * ────────────────────────────────────────────────────────── */

const EMOTIONS: EmotionSegment[] = [
  { label: "Happy", percentage: 35, color: Colors.primary },
  { label: "Calm", percentage: 25, color: Colors.primaryLight },
  { label: "Anxious", percentage: 20, color: Colors.warning },
  { label: "Sad", percentage: 12, color: "#9E9E9E" },
  { label: "Angry", percentage: 8, color: Colors.error },
];

/* ──────────────────────────────────────────────────────────
 * Donut chart helpers
 * ────────────────────────────────────────────────────────── */

const SIZE = 140;
const STROKE_WIDTH = 14;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

function buildSegments(data: EmotionSegment[]) {
  let cumulativeOffset = 0;

  return data.map((segment) => {
    const dashLength = (segment.percentage / 100) * CIRCUMFERENCE;
    const gapLength = CIRCUMFERENCE - dashLength;
    const offset = -cumulativeOffset;
    cumulativeOffset += dashLength;

    return {
      ...segment,
      dashArray: `${dashLength} ${gapLength}`,
      dashOffset: offset,
    };
  });
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const EmotionBreakdown: React.FC<EmotionBreakdownProps> = ({ style }) => {
  const segments = buildSegments(EMOTIONS);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Emotions this week</Text>
      <Text style={styles.subtitle}>Breakdown of your recorded feelings</Text>

      <View style={styles.body}>
        {/* Donut chart */}
        <View style={styles.chartContainer}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Background ring */}
            <SvgCircle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke={Colors.borderLight}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />

            {/* Data segments */}
            <G rotation={-90} origin={`${CENTER}, ${CENTER}`}>
              {segments.map((seg) => (
                <SvgCircle
                  key={seg.label}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  stroke={seg.color}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={seg.dashArray}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}
            </G>
          </Svg>

          {/* Centre label */}
          <View style={styles.centerLabel}>
            <Text style={styles.centerPercentage}>
              {EMOTIONS[0].percentage}%
            </Text>
            <Text style={styles.centerText}>{EMOTIONS[0].label}</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {EMOTIONS.map((emotion) => (
            <View key={emotion.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: emotion.color }]} />
              <Text style={styles.legendLabel}>{emotion.label}</Text>
              <Text style={styles.legendValue}>{emotion.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
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
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.base,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartContainer: {
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
  },
  centerPercentage: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  centerText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  legend: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  legendLabel: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  legendValue: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
});
