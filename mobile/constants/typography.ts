import { Platform } from "react-native";

/**
 * Moody-AI typographic scale.
 *
 * Uses the system font stack for maximum readability on each platform.
 * All values are unitless (dp on Android, pt on iOS).
 */

const FONT_FAMILY = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  heading: 28,
  hero: 34,
} as const;

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const Typography = {
  fontFamily: FONT_FAMILY,

  hero: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.hero * LineHeight.tight,
  },
  heading: {
    fontSize: FontSize.heading,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.heading * LineHeight.tight,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.xl * LineHeight.normal,
  },
  body: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.md * LineHeight.relaxed,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.sm * LineHeight.relaxed,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.xs * LineHeight.relaxed,
  },
  button: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.md * LineHeight.normal,
  },
  link: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * LineHeight.normal,
  },
} as const;
