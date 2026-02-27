import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Typography, FontSize } from "@/constants/typography";
import { Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export interface MoodOption {
  /** Unique key for this mood level. */
  key: string;
  /** Human-readable label shown below the emoji. */
  label: string;
  /** Require-resolved PNG asset. */
  icon: ImageSourcePropType;
}

interface MoodSelectorProps {
  /** Currently selected mood key (or null if none selected). */
  selectedMood: string | null;
  /** Called when a mood is tapped. */
  onSelectMood: (key: string) => void;
  /** Override container style. */
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Mood options (order: worst → best)
 * ────────────────────────────────────────────────────────── */

export const MOOD_OPTIONS: MoodOption[] = [
  { key: "awful", label: "Awful", icon: require("@/assets/images/worst-face.png") },
  { key: "bad", label: "Bad", icon: require("@/assets/images/sad.png") },
  { key: "okay", label: "Okay", icon: require("@/assets/images/smiley.png") },
  { key: "good", label: "Good", icon: require("@/assets/images/smile.png") },
  { key: "great", label: "Great", icon: require("@/assets/images/vey-happy-face.png") },
];

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  style,
}) => (
  <View style={[styles.container, style]}>
    <Text style={styles.sectionTitle}>Daily mood</Text>

    <View style={styles.row}>
      {MOOD_OPTIONS.map((mood) => {
        const isSelected = selectedMood === mood.key;

        return (
          <Pressable
            key={mood.key}
            onPress={() => onSelectMood(mood.key)}
            style={[
              styles.moodItem,
              isSelected && styles.moodItemSelected,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Select mood: ${mood.label}`}
            accessibilityState={{ selected: isSelected }}
          >
            <View style={[styles.emojiCircle, isSelected && styles.emojiCircleSelected]}>
              <Image source={mood.icon} style={styles.emojiImage} />
            </View>
            <Text
              style={[
                styles.moodLabel,
                isSelected && styles.moodLabelSelected,
              ]}
            >
              {mood.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moodItem: {
    alignItems: "center",
    flex: 1,
  },
  moodItemSelected: {
    transform: [{ scale: 1.1 }],
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.transparent,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiCircleSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#FFF3EC",
  },
  emojiImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  moodLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  moodLabelSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
