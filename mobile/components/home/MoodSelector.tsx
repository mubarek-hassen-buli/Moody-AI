import React, { useCallback, useEffect } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { Spacing, BorderRadius } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export interface MoodOption {
  key: string;
  label: string;
  icon: ImageSourcePropType;
}

export type MoodSelectorState = "idle" | "pending" | "confirmed";

interface MoodSelectorProps {
  /** Currently selected mood key (or null). */
  selectedMood: string | null;
  /** State driven by the parent: idle → pending → confirmed */
  selectorState: MoodSelectorState;
  /** Called when user taps a mood emoji. */
  onSelectMood: (key: string) => void;
  /** Override container style. */
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Mood options
 * ────────────────────────────────────────────────────────── */

export const MOOD_OPTIONS: MoodOption[] = [
  { key: "awful", label: "Awful", icon: require("@/assets/images/worst-face.png") },
  { key: "bad",   label: "Bad",   icon: require("@/assets/images/sad.png") },
  { key: "okay",  label: "Okay",  icon: require("@/assets/images/smiley.png") },
  { key: "good",  label: "Good",  icon: require("@/assets/images/smile.png") },
  { key: "great", label: "Great", icon: require("@/assets/images/vey-happy-face.png") },
];

/* ──────────────────────────────────────────────────────────
 * Spinning Emoji — isolated component so each emoji has its
 * own shared value and does not affect siblings
 * ────────────────────────────────────────────────────────── */

interface SpinningEmojiProps {
  mood: MoodOption;
  isSelected: boolean;
  isSpinning: boolean;
  onPress: () => void;
}

const SpinningEmoji: React.FC<SpinningEmojiProps> = ({
  mood,
  isSelected,
  isSpinning,
  onPress,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSpinning) {
      // Start infinite counter-clockwise spin while API call is in flight
      rotation.value = withRepeat(
        withTiming(360, { duration: 700, easing: Easing.linear }),
        -1,
        false,
      );
      scale.value = withSpring(1.15);
    } else {
      cancelAnimation(rotation);
      rotation.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(isSelected ? 1.1 : 1);
    }
  }, [isSpinning, isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Pressable
      key={mood.key}
      onPress={onPress}
      style={styles.moodItem}
      accessibilityRole="button"
      accessibilityLabel={`Select mood: ${mood.label}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View style={[styles.emojiCircle, isSelected && styles.emojiCircleSelected, animatedStyle]}>
        <Image source={mood.icon} style={styles.emojiImage} />
      </Animated.View>
      <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
        {mood.label}
      </Text>
    </Pressable>
  );
};

/* ──────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────── */

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  selectorState,
  onSelectMood,
  style,
}) => {
  const confirmedOpacity = useSharedValue(0);
  const selectorOpacity = useSharedValue(1);

  useEffect(() => {
    if (selectorState === "confirmed") {
      // Fade out the picker, fade in the confirmation banner
      selectorOpacity.value = withTiming(0, { duration: 400 });
      confirmedOpacity.value = withTiming(1, { duration: 500 });
    } else {
      // Fade the picker back in
      confirmedOpacity.value = withTiming(0, { duration: 200 });
      selectorOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [selectorState]);

  const selectorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: selectorOpacity.value,
  }));

  const confirmedAnimatedStyle = useAnimatedStyle(() => ({
    opacity: confirmedOpacity.value,
  }));

  const selectedOption = MOOD_OPTIONS.find((m) => m.key === selectedMood);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>Daily mood</Text>

      {/* ── Confirmed Banner ─────────────────────────────── */}
      {selectorState === "confirmed" && (
        <Animated.View style={[styles.confirmedBanner, confirmedAnimatedStyle]}>
          <Image source={selectedOption?.icon} style={styles.confirmedIcon} />
          <View>
            <Text style={styles.confirmedTitle}>Daily mood selected!</Text>
            <Text style={styles.confirmedSubtitle}>
              You&apos;re feeling {selectedOption?.label.toLowerCase()}. See you tomorrow 👋
            </Text>
          </View>
        </Animated.View>
      )}

      {/* ── Emoji Picker ─────────────────────────────────── */}
      {selectorState !== "confirmed" && (
        <Animated.View style={[styles.row, selectorAnimatedStyle]}>
          {MOOD_OPTIONS.map((mood) => (
            <SpinningEmoji
              key={mood.key}
              mood={mood}
              isSelected={selectedMood === mood.key}
              isSpinning={selectorState === "pending" && selectedMood === mood.key}
              onPress={() => onSelectMood(mood.key)}
            />
          ))}
        </Animated.View>
      )}

      {/* Pending hint */}
      {selectorState === "pending" && (
        <Text style={styles.hintText}>Tap another emoji to change your mood…</Text>
      )}
    </View>
  );
};

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
  confirmedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3EC",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  confirmedIcon: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },
  confirmedTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    fontFamily: Typography.fontFamily,
  },
  confirmedSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    marginTop: 2,
  },
  hintText: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: "center",
    marginTop: Spacing.sm,
    fontFamily: Typography.fontFamily,
  },
});
