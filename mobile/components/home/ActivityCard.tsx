import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface ActivityCardProps {
  /** Card title. */
  title: string;
  /** Card subtitle / description. */
  subtitle: string;
  /** Background tint for the card. */
  backgroundColor?: string;
  /** Called when the card is pressed. */
  onPress?: () => void;
  /** Override container style. */
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Arrow icon
 * ────────────────────────────────────────────────────────── */

const ArrowIcon: React.FC = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 17L17 7M17 7H7M17 7v10"
      stroke={Colors.textPrimary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  subtitle,
  backgroundColor = "#FFF3EC",
  onPress,
  style,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.card,
      { backgroundColor },
      pressed && styles.pressed,
      style,
    ]}
    accessibilityRole="button"
    accessibilityLabel={title}
  >
    <View style={styles.content}>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </View>
    <View style={styles.arrowContainer}>
      <ArrowIcon />
    </View>
  </Pressable>
);

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    minHeight: 140,
    justifyContent: "space-between",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  arrowContainer: {
    alignSelf: "flex-end",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
});
