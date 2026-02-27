import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import Svg, { Path, Line, Circle, Text as SvgText } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface MoodChartProps {
  /** Override container style. */
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Mock data — mood values 1 (awful) to 5 (great) per day
 * ────────────────────────────────────────────────────────── */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MOOD_VALUES = [3, 4, 2, 5, 4, 3, 4];

const CHART_WIDTH = 300;
const CHART_HEIGHT = 120;
const PADDING_LEFT = 10;
const PADDING_RIGHT = 10;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 20;

const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

function buildLinePath(values: number[]): string {
  const maxVal = 5;
  const minVal = 1;
  const range = maxVal - minVal;

  return values
    .map((val, i) => {
      const x = PADDING_LEFT + (i / (values.length - 1)) * PLOT_WIDTH;
      const y = PADDING_TOP + PLOT_HEIGHT - ((val - minVal) / range) * PLOT_HEIGHT;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[]): string {
  const linePath = buildLinePath(values);
  const lastX = PADDING_LEFT + PLOT_WIDTH;
  const firstX = PADDING_LEFT;
  const bottomY = PADDING_TOP + PLOT_HEIGHT;
  return `${linePath} L${lastX},${bottomY} L${firstX},${bottomY} Z`;
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const MoodChart: React.FC<MoodChartProps> = ({ style }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.title}>Mood this week</Text>
    <Text style={styles.subtitle}>Your emotional trend over the past 7 days</Text>

    <View style={styles.chartWrapper}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        {/* Grid lines */}
        {[1, 2, 3, 4, 5].map((level) => {
          const y = PADDING_TOP + PLOT_HEIGHT - ((level - 1) / 4) * PLOT_HEIGHT;
          return (
            <Line
              key={level}
              x1={PADDING_LEFT}
              y1={y}
              x2={PADDING_LEFT + PLOT_WIDTH}
              y2={y}
              stroke={Colors.borderLight}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Area fill */}
        <Path
          d={buildAreaPath(MOOD_VALUES)}
          fill={Colors.primaryLight}
          opacity={0.3}
        />

        {/* Line */}
        <Path
          d={buildLinePath(MOOD_VALUES)}
          stroke={Colors.primary}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {MOOD_VALUES.map((val, i) => {
          const x = PADDING_LEFT + (i / (MOOD_VALUES.length - 1)) * PLOT_WIDTH;
          const y = PADDING_TOP + PLOT_HEIGHT - ((val - 1) / 4) * PLOT_HEIGHT;
          return <Circle key={i} cx={x} cy={y} r={3.5} fill={Colors.primary} />;
        })}

        {/* Day labels */}
        {DAYS.map((day, i) => {
          const x = PADDING_LEFT + (i / (DAYS.length - 1)) * PLOT_WIDTH;
          return (
            <SvgText
              key={day}
              x={x}
              y={CHART_HEIGHT - 2}
              textAnchor="middle"
              fontSize={9}
              fill={Colors.textTertiary}
            >
              {day}
            </SvgText>
          );
        })}
      </Svg>
    </View>
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
  chartWrapper: {
    alignItems: "center",
  },
});
