import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface DividerProps {
  /** Text displayed in the centre of the divider line. */
  label?: string;
  /** Optional style overrides. */
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const Divider: React.FC<DividerProps> = ({
  label = "Or",
  style,
}) => (
  <View style={[styles.container, style]}>
    <View style={styles.line} />
    {label ? <Text style={styles.label}>{label}</Text> : null}
    <View style={styles.line} />
  </View>
);

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.divider,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.base,
  },
});
