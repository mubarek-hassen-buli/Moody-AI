/**
 * Moody-AI spacing scale.
 *
 * Based on a 4 px base unit for consistent rhythm across all screens.
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
} as const;

/** Standard horizontal padding for screen content. */
export const SCREEN_PADDING = Spacing.xl;

/** Border radius presets. */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
} as const;
