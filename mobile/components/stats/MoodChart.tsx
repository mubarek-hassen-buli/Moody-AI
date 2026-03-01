import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Colors } from "@/constants/colors";
import { FontSize, FontWeight, Typography } from "@/constants/typography";
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

/** Map backend score (1–5) to a 0–100 scale for the chart */
const scoreToValue = (score: number) => ((score - 1) / 4) * 100;

const CHART_WIDTH = Dimensions.get("window").width - 80; // card padding on both sides

const MOOD_LABELS: Record<number, string> = {
  1: "Awful",
  2: "Bad",
  3: "Okay",
  4: "Good",
  5: "Great",
};

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const MoodChart: React.FC<MoodChartProps> = ({ style, data, loading }) => {
  const hasData = data && data.some((d) => d.score !== null);

  /** Transform weekly data into the shape gifted-charts expects */
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((day) => ({
      value: day.score !== null ? scoreToValue(day.score) : 0,
      label: day.day,
      // Hide data point for days with no mood logged
      hideDataPoint: day.score === null,
      dataPointColor: Colors.primary,
      dataPointRadius: 4,
      showStrip: false,
    }));
  }, [data]);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Mood this week</Text>
      <Text style={styles.subtitle}>Your emotional trend over the past 7 days</Text>

      {loading && <Text style={styles.emptyText}>Loading chart…</Text>}

      {!loading && !hasData && (
        <Text style={styles.emptyText}>Log your first mood to see the chart!</Text>
      )}

      {!loading && hasData && (
        <LineChart
          data={chartData}
          width={CHART_WIDTH}
          height={130}
          /* Colours */
          color={Colors.primary}
          startFillColor={Colors.primaryLight}
          endFillColor="transparent"
          areaChart
          /* Line style */
          thickness={2.5}
          curved
          /* Data points */
          dataPointsColor={Colors.primary}
          dataPointsRadius={4}
          /* Y axis */
          maxValue={100}
          noOfSections={4}
          yAxisColor="transparent"
          yAxisTextStyle={{ color: Colors.textTertiary, fontSize: 9 }}
          yAxisLabelTexts={["Awful", "Bad", "Okay", "Good", "Great"]}
          /* X axis */
          xAxisColor={Colors.borderLight}
          xAxisLabelTextStyle={{
            color: Colors.textTertiary,
            fontSize: 9,
            fontFamily: Typography.fontFamily,
          }}
          /* Grid */
          rulesColor={Colors.borderLight}
          rulesType="solid"
          /* Hide right axis */
          hideRules={false}
          /* Remove default end spacing */
          endSpacing={0}
          initialSpacing={6}
          /* Tooltip on press */
          focusEnabled
          showStripOnFocus
          stripColor={Colors.primary}
          stripOpacity={0.15}
          focusedDataPointColor={Colors.primaryDark}
          focusedDataPointRadius={6}
        />
      )}
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
    paddingBottom: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
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
});
