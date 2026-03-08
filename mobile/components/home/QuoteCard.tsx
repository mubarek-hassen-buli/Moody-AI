import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { useQuoteOfDay, useRefreshQuote } from "@/hooks/useQuote";

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */

const QuoteIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 21c3-3 4-6 4-9V7a2 2 0 012-2h2a2 2 0 012 2v3a2 2 0 01-2 2H9c0 3-1 5.5-3 7.5"
      stroke={Colors.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 21c3-3 4-6 4-9V7a2 2 0 012-2h2a2 2 0 012 2v3a2 2 0 01-2 2h-2c0 3-1 5.5-3 7.5"
      stroke={Colors.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RefreshIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 4v6h-6M1 20v-6h6"
      stroke={Colors.textTertiary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
      stroke={Colors.textTertiary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const QuoteCard: React.FC = () => {
  const { data: quote, isLoading } = useQuoteOfDay();
  const refreshQuote = useRefreshQuote();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshQuote();
    } finally {
      setRefreshing(false);
    }
  }, [refreshQuote]);

  if (isLoading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  if (!quote) return null;

  return (
    <View style={styles.card}>
      {/* Quote icon */}
      <View style={styles.iconRow}>
        <View style={styles.iconCircle}>
          <QuoteIcon />
        </View>
        <Text style={styles.label}>Daily Inspiration</Text>
        <Pressable
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
          hitSlop={12}
          accessibilityLabel="Get a new quote"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={Colors.textTertiary} />
          ) : (
            <RefreshIcon />
          )}
        </Pressable>
      </View>

      {/* Quote text */}
      <Text style={styles.quoteText}>"{quote.quoteText}"</Text>

      {/* Author */}
      {quote.author && (
        <Text style={styles.author}>— {quote.author}</Text>
      )}
    </View>
  );
};

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  loadingCard: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Header row */
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF3EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    fontFamily: Typography.fontFamily,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Quote body */
  quoteText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: Spacing.sm,
  },
  author: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    textAlign: "right",
  },
});
