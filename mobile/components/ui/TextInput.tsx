import React, { useState } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  type KeyboardTypeOptions,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Typography, FontSize } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface TextInputProps {
  /** Label displayed above the input. */
  label?: string;
  /** Placeholder text shown when the input is empty. */
  placeholder?: string;
  /** Current value of the input field. */
  value: string;
  /** Callback fired when the text changes. */
  onChangeText: (text: string) => void;
  /** Helper text displayed below the input. */
  helperText?: string;
  /** Error message — replaces helper text and highlights the border. */
  errorText?: string;
  /** Keyboard layout hint. */
  keyboardType?: KeyboardTypeOptions;
  /** Masks the input for passwords. */
  secureTextEntry?: boolean;
  /** Capitalisation behaviour. */
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  /** Outer container style overrides. */
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  helperText,
  errorText,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "none",
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = Boolean(errorText);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <RNTextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        accessibilityLabel={label}
      />

      {(helperText || errorText) && (
        <Text style={[styles.helperText, hasError && styles.errorText]}>
          {errorText ?? helperText}
        </Text>
      )}
    </View>
  );
};

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  input: {
    height: 52,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.lg,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    marginLeft: Spacing.lg,
  },
  errorText: {
    color: Colors.error,
  },
});
