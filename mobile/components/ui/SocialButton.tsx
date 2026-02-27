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
import { Typography } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

type SocialProvider = "google" | "facebook";

interface SocialButtonProps {
  /** Which provider icon & label to display. */
  provider: SocialProvider;
  /** Called when the button is pressed. */
  onPress?: () => void;
  /** Optional style overrides. */
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Icons (inline SVG for zero extra deps)
 * ────────────────────────────────────────────────────────── */

const GoogleIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48">
    <Path
      d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
      fill="#FFC107"
    />
    <Path
      d="M5.3 14.7l7.4 5.4C14.5 16.2 18.9 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 15.4 2 8.1 7.3 5.3 14.7z"
      fill="#FF3D00"
    />
    <Path
      d="M24 46c5.4 0 10.3-1.8 14.1-5l-6.9-5.7C29.1 37.1 26.7 38 24 38c-6 0-11.1-4-12.8-9.5l-7.3 5.6C7 41.3 14.9 46 24 46z"
      fill="#4CAF50"
    />
    <Path
      d="M44.5 20H24v8.5h11.8c-1 3.3-3.2 6-6.1 7.8l6.9 5.7C40.4 38.5 46 32 46 24c0-1.3-.2-2.7-.5-4z"
      fill="#1976D2"
    />
  </Svg>
);

const FacebookIcon: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 48 48">
    <Path
      d="M24 2C11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22S36.2 2 24 2zm4.8 15h-3.3c-.4 0-.8.5-.8 1.2V21h4.1l-.6 3.5h-3.5V35h-4.2V24.5h-2.8V21h2.8v-2.4c0-2.3 1.6-4.3 4.4-4.3h3v3.7z"
      fill={Colors.facebook}
    />
  </Svg>
);

const providerConfig: Record<
  SocialProvider,
  { label: string; Icon: React.FC }
> = {
  google: { label: "Sign in with Google", Icon: GoogleIcon },
  facebook: { label: "Sign in with Facebook", Icon: FacebookIcon },
};

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  style,
}) => {
  const { label, Icon } = providerConfig[provider];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.iconWrapper}>
        <Icon />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconWrapper: {
    marginRight: Spacing.md,
  },
  label: {
    ...Typography.button,
    color: Colors.textPrimary,
  },
});
