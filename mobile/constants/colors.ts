/**
 * Moody-AI color palette.
 *
 * Warm, approachable tones that evoke emotional safety and positivity.
 * Primary orange represents energy & optimism; neutral beiges convey calm.
 */
export const Colors = {
  /** ── Brand ─────────────────────────────────────────────── */
  primary: "#F07033",
  primaryDark: "#D95A1B",
  primaryLight: "#F8A775",

  /** ── Backgrounds ───────────────────────────────────────── */
  background: "#FDF6F0",
  backgroundSecondary: "#FFFFFF",
  card: "#FFFFFF",

  /** ── Text ──────────────────────────────────────────────── */
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textTertiary: "#9E9E9E",
  textInverse: "#FFFFFF",

  /** ── Borders & Dividers ────────────────────────────────── */
  border: "#E8E0D8",
  borderLight: "#F0EBE5",
  divider: "#E0D8D0",

  /** ── States ────────────────────────────────────────────── */
  error: "#E53935",
  success: "#43A047",
  warning: "#FB8C00",

  /** ── Social ────────────────────────────────────────────── */
  google: "#4285F4",
  facebook: "#1877F2",

  /** ── Misc ──────────────────────────────────────────────── */
  overlay: "rgba(0, 0, 0, 0.35)",
  transparent: "transparent",
  shadow: "rgba(0, 0, 0, 0.08)",
} as const;

export type ColorKey = keyof typeof Colors;
