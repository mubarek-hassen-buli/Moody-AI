import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import Svg, { Path, Line, Circle, Text as SvgText } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";
import type { WeeklyDay } from "@/hooks/useMood";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface MoodChartProps {
  style?: ViewStyle;
  /** Weekly mood data from the backend. Null scores are rendered as gaps. */
  data?: WeeklyDay[];
  loading?: boolean;
}

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

const CHART_WIDTH = 300;
const CHART_HEIGHT = 120;
const PADDING_LEFT = 10;
const PADDING_RIGHT = 10;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 20;
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

function buildLinePath(days: WeeklyDay[]): string {
  const filled = days.filter((d) => d.score !== null);
  if (filled.length < 2) return '';

  return days
    .reduce<string[]>((acc, day, i) => {
      if (day.score === null) return acc;
      const x = PADDING_LEFT + (i / (days.length - 1)) * PLOT_WIDTH;
      const y = PADDING_TOP + PLOT_HEIGHT - ((day.score - 1) / 4) * PLOT_HEIGHT;
      acc.push(`${acc.length === 0 ? 'M' : 'L'}${x},${y}`);
      return acc;
    }, [])
    .join(' ');
}

function buildAreaPath(days: WeeklyDay[]): string {
  const linePath = buildLinePath(days);
  if (!linePath) return '';
  const lastX = PADDING_LEFT + PLOT_WIDTH;
  const firstX = PADDING_LEFT;
  const bottomY = PADDING_TOP + PLOT_HEIGHT;
  return `${linePath} L${lastX},${bottomY} L${firstX},${bottomY} Z`;
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const MoodChart: React.FC<MoodChartProps> = ({ style, data, loading }) => {
  const hasData = data && data.some((d) => d.score !== null);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Mood this week</Text>
      <Text style={styles.subtitle}>Your emotional trend over the past 7 days</Text>

      <View style={styles.chartWrapper}>
        {loading && (
          <Text style={styles.emptyText}>Loading...</Text>
        )}
        {!loading && !hasData && (
          <Text style={styles.emptyText}>Log your first mood to see the chart!</Text>
        )}
        {!loading && hasData && data && (
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
              d={buildAreaPath(data)}
              fill={Colors.primaryLight}
              opacity={0.3}
            />

            {/* Line */}
            <Path
              d={buildLinePath(data)}
              stroke={Colors.primary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points (only for days with scores) */}
            {data.map((day, i) => {
              if (day.score === null) return null;
              const x = PADDING_LEFT + (i / (data.length - 1)) * PLOT_WIDTH;
              const y = PADDING_TOP + PLOT_HEIGHT - ((day.score - 1) / 4) * PLOT_HEIGHT;
              return <Circle key={i} cx={x} cy={y} r={3.5} fill={Colors.primary} />;
            })}

            {/* Day labels */}
            {data.map((day, i) => {
              const x = PADDING_LEFT + (i / (data.length - 1)) * PLOT_WIDTH;
              return (
                <SvgText
                  key={day.day}
                  x={x}
                  y={CHART_HEIGHT - 2}
                  textAnchor="middle"
                  fontSize={9}
                  fill={Colors.textTertiary}
                >
                  {day.day}
                </SvgText>
              );
            })}
          </Svg>
        )}
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
  chartWrapper: {
    alignItems: "center",
    minHeight: 60,
    justifyContent: "center",
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    textAlign: "center",
    paddingVertical: Spacing.base,
  },
});
