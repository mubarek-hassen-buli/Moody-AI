import React, { useState, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";

import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { Spacing, SCREEN_PADDING, BorderRadius } from "@/constants/spacing";
import { useSearch } from "@/hooks/useSearch";
import type { JournalEntry } from "@/hooks/useJournal";
import type { AudioTrackData } from "@/hooks/useAudio";

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */

const SearchIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke={Colors.textTertiary} strokeWidth={2} />
    <Path
      d="M21 21l-4.35-4.35"
      stroke={Colors.textTertiary}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const BackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M5 12l7 7M5 12l7-7"
      stroke={Colors.textPrimary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ClearIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} fill={Colors.borderLight} />
    <Path
      d="M15 9l-6 6M9 9l6 6"
      stroke={Colors.textTertiary}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const JournalIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
      stroke={Colors.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
      stroke={Colors.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AudioIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18V5l12-2v13"
      stroke="#43A047"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={6} cy={18} r={3} stroke="#43A047" strokeWidth={2} />
    <Circle cx={18} cy={16} r={3} stroke="#43A047" strokeWidth={2} />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Types for the FlatList
 * ────────────────────────────────────────────────────────── */

type SectionHeaderItem = { type: "header"; title: string; count: number };
type JournalItem = { type: "journal"; data: JournalEntry };
type AudioItem = { type: "audio"; data: AudioTrackData };
type ListItem = SectionHeaderItem | JournalItem | AudioItem;

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

/** Truncate text for preview. */
function truncate(text: string, maxLen = 80): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

/** Format ISO date to a human-readable string. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const { journals, audioTracks, totalCount, isLoading } = useSearch(query);

  // Build a flat list of items with section headers
  const listData: ListItem[] = [];

  if (journals.length > 0) {
    listData.push({ type: "header", title: "Journal Entries", count: journals.length });
    journals.forEach((j) => listData.push({ type: "journal", data: j }));
  }

  if (audioTracks.length > 0) {
    listData.push({ type: "header", title: "Audio Tracks", count: audioTracks.length });
    audioTracks.forEach((a) => listData.push({ type: "audio", data: a }));
  }

  /* ── Navigation handlers ──────────────────────────────── */

  const handleJournalPress = useCallback(
    (entry: JournalEntry) => {
      router.navigate("/(tabs)/journal" as any);
    },
    [router],
  );

  const handleAudioPress = useCallback(
    (track: AudioTrackData) => {
      router.push({
        pathname: "/audio-player" as any,
        params: {
          id: track.id,
          title: track.title,
          duration: track.duration,
          audioUrl: track.audioUrl,
          category: track.category,
        },
      });
    },
    [router],
  );

  /* ── Render items ─────────────────────────────────────── */

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "header") {
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
          </View>
        );
      }

      if (item.type === "journal") {
        return (
          <Pressable
            style={({ pressed }) => [styles.resultCard, pressed && styles.pressed]}
            onPress={() => handleJournalPress(item.data)}
          >
            <View style={styles.resultIconWrapper}>
              <JournalIcon />
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle} numberOfLines={1}>
                {item.data.title}
              </Text>
              <Text style={styles.resultSubtitle} numberOfLines={1}>
                {truncate(item.data.content)}
              </Text>
              <Text style={styles.resultMeta}>{formatDate(item.data.createdAt)}</Text>
            </View>
          </Pressable>
        );
      }

      if (item.type === "audio") {
        return (
          <Pressable
            style={({ pressed }) => [styles.resultCard, pressed && styles.pressed]}
            onPress={() => handleAudioPress(item.data)}
          >
            <View style={[styles.resultIconWrapper, styles.audioIconBg]}>
              <AudioIcon />
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle} numberOfLines={1}>
                {item.data.title}
              </Text>
              <Text style={styles.resultSubtitle} numberOfLines={1}>
                {item.data.category === "relaxing" ? "Relaxing Audio" : "Workout Audio"} · {item.data.duration}
              </Text>
            </View>
          </Pressable>
        );
      }

      return null;
    },
    [handleJournalPress, handleAudioPress],
  );

  const keyExtractor = useCallback(
    (item: ListItem, index: number) => {
      if (item.type === "header") return `header-${item.title}`;
      if (item.type === "journal") return `journal-${item.data.id}`;
      if (item.type === "audio") return `audio-${item.data.id}`;
      return `item-${index}`;
    },
    [],
  );

  /* ── Empty / idle states ──────────────────────────────── */

  const hasQuery = query.trim().length > 0;

  const ListEmptyComponent = (
    <View style={styles.emptyContainer}>
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : hasQuery ? (
        <>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Try searching for a journal title, audio track, or topic
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>Search your content</Text>
          <Text style={styles.emptySubtitle}>
            Find journals, audio tracks, and more
          </Text>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* ── Search Header ──────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <BackIcon />
        </Pressable>

        <View style={styles.searchInputContainer}>
          <SearchIcon />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search journals, audio..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {hasQuery && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <ClearIcon />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Results count chip ─────────────────────────────── */}
      {hasQuery && !isLoading && (
        <View style={styles.resultCountRow}>
          <Text style={styles.resultCountText}>
            {totalCount} {totalCount === 1 ? "result" : "results"} found
          </Text>
        </View>
      )}

      {/* ── Result List ────────────────────────────────────── */}
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        ListEmptyComponent={ListEmptyComponent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    paddingVertical: 0,
  },

  /* Result count */
  resultCountRow: {
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: Spacing.sm,
  },
  resultCountText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
  },

  /* List */
  listContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Spacing.sm,
  },

  /* Section headers */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
  countBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primaryDark,
    fontFamily: Typography.fontFamily,
  },

  /* Result cards */
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: Spacing.md,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  resultIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF3EC",
    alignItems: "center",
    justifyContent: "center",
  },
  audioIconBg: {
    backgroundColor: "#E8F5E9",
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    marginBottom: 2,
  },
  resultMeta: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily,
  },

  /* Empty state */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: Spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    textAlign: "center",
    lineHeight: 20,
  },
});
