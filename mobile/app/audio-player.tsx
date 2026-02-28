import React from "react";
import { View, StyleSheet, Text, Pressable, Image, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path, Rect } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */

const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={Colors.textPrimary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlayPauseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x="8" y="6" width="3" height="12" rx="1.5" fill="#FFF" />
    <Rect x="13" y="6" width="3" height="12" rx="1.5" fill="#FFF" />
  </Svg>
);

const SkipBackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M19 20L9 12L19 4V20Z" fill={Colors.textSecondary} />
    <Rect x="5" y="4" width="2" height="16" fill={Colors.textSecondary} />
  </Svg>
);

const SkipForwardIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M5 4L15 12L5 20V4Z" fill={Colors.textSecondary} />
    <Rect x="17" y="4" width="2" height="16" fill={Colors.textSecondary} />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Audio Waveform Mock
 * ────────────────────────────────────────────────────────── */
const WAVEFORM_BARS = [
  3, 5, 4, 7, 5, 8, 10, 8, 12, 10, 14, 11, 8, 10, 6, 8, 10, 12, 10, 7, 5, 4, 3
];
const CURRENT_PROGRESS_INDEX = 12; // Everything before this is "played"

export default function AudioPlayerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string, title?: string }>();
  const displayTitle = params.title || "Morning Breathing";

  // Draw the progress arc hugging the top of our curved background
  // R = 300, W = 600, we just want a simple top curve arc
  const arcRadius = 290;
  const cx = SCREEN_WIDTH / 2;
  const cy = 300; // Center of the huge circle
  // We'll just define a generic arc path scaled to screen width
  const arcData = `M 40,80 Q ${SCREEN_WIDTH / 2},-20 ${SCREEN_WIDTH - 40},80`;

  return (
    <View style={styles.root}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <BackIcon />
        </Pressable>
        <Text style={styles.headerTitle}>{displayTitle}</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* ── Illustration ─────────────────────────────────────── */}
      <View style={styles.imageContainer}>
        <Image
          // Replace with the required yoga image
          source={require("@/assets/images/yoga.jpg")}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      {/* ── Player Bottom Container ──────────────────────────── */}
      <View style={styles.bottomSheetWrapper}>
        <View style={styles.hugeCircleBackground} />

        {/* Arc Progress (mocked as an SVG) */}
        <View style={styles.arcContainer}>
          <Svg width={SCREEN_WIDTH} height={120}>
            {/* Background Arch */}
            <Path d={arcData} stroke={Colors.card} strokeWidth={8} fill="none" strokeLinecap="round" />
            {/* Progress Arch - darker part */}
            <Path d={`M 40,80 Q ${SCREEN_WIDTH / 2},-20 ${SCREEN_WIDTH / 2 + 20},15`} stroke={Colors.textPrimary} strokeWidth={8} fill="none" strokeLinecap="round" />
          </Svg>
        </View>

        <View style={styles.playerContent}>
          {/* Timer Pill */}
          <View style={styles.timerPill}>
            <Text style={styles.timerText}>04:35</Text>
          </View>

          {/* Waveform */}
          <View style={styles.waveformContainer}>
            {WAVEFORM_BARS.map((heightMultiplier, idx) => {
              const played = idx <= CURRENT_PROGRESS_INDEX;
              return (
                <View
                  key={idx}
                  style={[
                    styles.waveformBar,
                    { height: heightMultiplier * 4 },
                    played ? styles.barPlayed : styles.barUnplayed
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.timeLabelsRow}>
            <Text style={styles.timeLabel}>2.25</Text>
            <Text style={styles.timeLabel}>4:35</Text>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <Pressable style={styles.secondaryButton}>
              <SkipBackIcon />
            </Pressable>
            <Pressable style={styles.playButton}>
              <PlayPauseIcon />
            </Pressable>
            <Pressable style={styles.secondaryButton}>
              <SkipForwardIcon />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background, // Match Moody-AI soft beige
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
    backgroundColor: "transparent",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonPlaceholder: {
    width: 44,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    // Takes up the top chunk
    height: SCREEN_HEIGHT * 0.45,
    marginTop: -20, // Let it bleed up behind header slightly
  },
  illustration: {
    width: '100%',
    height: '100%',
    opacity: 0.95, // slight fade to blend with beige
  },

  // The massive curved bottom sheet
  bottomSheetWrapper: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    position: "relative",
    // Overlap the image slightly
    marginTop: -40,
  },
  hugeCircleBackground: {
    position: "absolute",
    top: 0,
    width: 1000,
    height: 1000,
    borderRadius: 500,
    backgroundColor: Colors.primaryLight, // Using our soft palette color (#FFF3EC etc)
  },
  arcContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  playerContent: {
    width: "100%",
    alignItems: "center",
    paddingTop: 85, // Push down below arc
    paddingHorizontal: 30,
    zIndex: 2,
  },
  timerPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  timerText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    gap: 4,
    justifyContent: "center",
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
  },
  barPlayed: {
    backgroundColor: Colors.primary, // Our Moody-AI primary orange color
  },
  barUnplayed: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.4,
  },
  timeLabelsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 40,
  },
  timeLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.textPrimary, // Almost black
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
