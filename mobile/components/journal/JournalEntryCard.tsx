import React, { useCallback } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { Colors } from "@/constants/colors";
import { FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";
import type { JournalEntry } from "@/hooks/useJournal";

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + "…" : text;
}

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
  style?: ViewStyle;
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onEdit,
  onDelete,
  style,
}) => {

  return (
    <Pressable
      onPress={() => onEdit(entry)}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Journal entry: ${entry.title}`}
    >
      {/* Date stamp */}
      <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {entry.title}
      </Text>

      {/* Content preview */}
      <Text style={styles.preview} numberOfLines={2}>
        {truncate(entry.content, 100)}
      </Text>

      {/* Delete button */}
      <Pressable
        onPress={() => onDelete(entry)}
        hitSlop={12}
        style={styles.deleteButton}
        accessibilityRole="button"
        accessibilityLabel="Delete entry"
      >
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </Pressable>
  );
};

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    paddingRight: Spacing.xl + Spacing.sm, // space for the delete button
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  date: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  preview: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  deleteButton: {
    position: "absolute",
    top: Spacing.base,
    right: Spacing.base,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: FontWeight.bold,
  },
});
