import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing, SCREEN_PADDING } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */
export interface AudioTrack {
  id: string;
  title: string;
  duration: string;
  author: string;
}

interface AudioListProps {
  title: string;
  subtitle: string;
  tracks: AudioTrack[];
}

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */
const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={Colors.textPrimary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlayIconMini = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M8 5v14l11-7z" fill="#FFF" />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */
export const AudioList: React.FC<AudioListProps> = ({ title, subtitle, tracks }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackIcon />
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {tracks.map((track) => (
          <Pressable 
            key={track.id} 
            style={styles.trackCard} 
            onPress={() => router.push({ pathname: "/audio-player" as any, params: { id: track.id, title: track.title } })}
          >
            <View style={styles.trackIconContainer}>
              <PlayIconMini />
            </View>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{track.title}</Text>
              <Text style={styles.trackAuthor}>{track.author} • {track.duration}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.primaryLight,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  backButtonPlaceholder: {
    width: 44,
  },
  headerTextBlock: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
  },
  trackIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  trackAuthor: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
