import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "outline" | "text";

interface ButtonProps {
  /** Button label. */
  label: string;
  /** Visual style variant. */
  variant?: ButtonVariant;
  /** Called when the button is pressed. */
  onPress?: () => void;
  /** Show a loading spinner and disable interaction. */
  loading?: boolean;
  /** Disable the button without showing a spinner. */
  disabled?: boolean;
  /** Optional style overrides for the outer container. */
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  onPress,
  loading = false,
  disabled = false,
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" ? Colors.textInverse : Colors.primary
          }
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            variantStyles[variant].label,
            isDisabled && styles.disabledLabel,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: BorderRadius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  label: {
    ...Typography.button,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  disabledLabel: {
    opacity: 0.7,
  },
});

const variantStyles: Record<
  ButtonVariant,
  { container: ViewStyle; label: TextStyle }
> = {
  primary: {
    container: {
      backgroundColor: Colors.primary,
    },
    label: {
      color: Colors.textInverse,
    },
  },
  outline: {
    container: {
      backgroundColor: Colors.transparent,
      borderWidth: 1.5,
      borderColor: Colors.border,
    },
    label: {
      color: Colors.textPrimary,
    },
  },
  text: {
    container: {
      backgroundColor: Colors.transparent,
    },
    label: {
      color: Colors.primary,
    },
  },
};
