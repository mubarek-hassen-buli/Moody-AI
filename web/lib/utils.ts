/**
 * Utility to merge conditional CSS class names cleanly without external dependencies.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
