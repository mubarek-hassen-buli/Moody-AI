import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { Audio, AVPlaybackStatus } from "expo-av";

import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { Spacing } from "@/constants/spacing";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */

const BackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke={Colors.textPrimary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PlayIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path d="M8 5v14l11-7z" fill="#FFF" />
  </Svg>
);

const PauseIcon = () => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Rect x="6" y="5" width="4" height="14" rx="1.5" fill="#FFF" />
    <Rect x="14" y="5" width="4" height="14" rx="1.5" fill="#FFF" />
  </Svg>
);

const SkipBackIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M19 20L9 12L19 4V20Z" fill={Colors.textSecondary} />
    <Rect x="5" y="4" width="2" height="16" rx="1" fill={Colors.textSecondary} />
  </Svg>
);

const SkipForwardIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M5 4L15 12L5 20V4Z" fill={Colors.textSecondary} />
    <Rect x="17" y="4" width="2" height="16" rx="1" fill={Colors.textSecondary} />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

/** Convert milliseconds → "M:SS" string */
function msToTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/* ──────────────────────────────────────────────────────────
 * Waveform mock bars
 * ────────────────────────────────────────────────────────── */

const WAVEFORM_BARS = [3, 5, 4, 7, 5, 8, 10, 8, 12, 10, 14, 11, 8, 10, 6, 8, 10, 12, 10, 7, 5, 4, 3];

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export default function AudioPlayerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    duration?: string;
    audioUrl?: string;
    category?: string;
  }>();

  const displayTitle = params.title ?? "Audio Session";
  const audioUrl = params.audioUrl ?? "";
  const isWorkout = params.category === "workout";

  // Pick the correct illustration based on audio category
  const illustrationSource = isWorkout
    ? require("@/assets/images/workout.jpg")
    : require("@/assets/images/yoga.jpg");

  // ── Playback state ─────────────────────────────────────
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  /* ── Load audio on mount ─────────────────────────────── */
  useEffect(() => {
    if (!audioUrl) return;

    let sound: Audio.Sound | null = null;

    const load = async () => {
      try {
        // Allow audio to play in silent / background mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });

        const { sound: loaded } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false },
          (status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            setPositionMs(status.positionMillis ?? 0);
            setDurationMs(status.durationMillis ?? 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPositionMs(0);
            }
          },
        );

        sound = loaded;
        soundRef.current = loaded;
        setIsLoaded(true);
      } catch (e) {
        console.warn("[AudioPlayer] Failed to load audio:", e);
      }
    };

    load();

    // Unload when leaving screen
    return () => {
      sound?.unloadAsync();
      soundRef.current = null;
    };
  }, [audioUrl]);

  /* ── Playback controls ───────────────────────────────── */

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current || !isLoaded) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  }, [isPlaying, isLoaded]);

  const handleSkipBack = useCallback(async () => {
    if (!soundRef.current || !isLoaded) return;
    const target = Math.max(0, positionMs - 15_000); // −15 s
    await soundRef.current.setPositionAsync(target);
  }, [positionMs, isLoaded]);

  const handleSkipForward = useCallback(async () => {
    if (!soundRef.current || !isLoaded || !durationMs) return;
    const target = Math.min(durationMs, positionMs + 15_000); // +15 s
    await soundRef.current.setPositionAsync(target);
  }, [positionMs, durationMs, isLoaded]);

  /* ── Progress calculations ───────────────────────────── */

  const progress = durationMs > 0 ? positionMs / durationMs : 0;
  const playedBars = Math.floor(progress * WAVEFORM_BARS.length);

  const arcData = `M 40,80 Q ${SCREEN_WIDTH / 2},-20 ${SCREEN_WIDTH - 40},80`;
  const progressX = 40 + (SCREEN_WIDTH - 80) * progress;
  const controlY = 80 - Math.sin(Math.PI * progress) * 100; // approximation
  const arcProgress = `M 40,80 Q ${SCREEN_WIDTH / 2},-20 ${progressX},${controlY}`;

  /* ── Render ──────────────────────────────────────────── */

  return (
    <View style={styles.root}>
      {/* ── Header ───────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <BackIcon />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayTitle}
        </Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* ── Illustration ─────────────────────────────────── */}
      <View style={styles.imageContainer}>
        <Image
          source={illustrationSource}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      {/* ── Bottom player sheet ───────────────────────────── */}
      <View style={styles.bottomSheetWrapper}>
        <View style={styles.hugeCircleBackground} />

        {/* Progress arc */}
        <View style={styles.arcContainer}>
          <Svg width={SCREEN_WIDTH} height={120}>
            {/* Background track */}
            <Path
              d={arcData}
              stroke={Colors.card}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
            />
            {/* Progress fill */}
            {durationMs > 0 && (
              <Path
                d={arcProgress}
                stroke={Colors.primary}
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
              />
            )}
          </Svg>
        </View>

        <View style={styles.playerContent}>
          {/* Live timer */}
          <View style={styles.timerPill}>
            <Text style={styles.timerText}>
              {msToTime(positionMs)}
            </Text>
          </View>

          {/* Waveform */}
          <View style={styles.waveformContainer}>
            {WAVEFORM_BARS.map((mult, idx) => (
              <View
                key={idx}
                style={[
                  styles.waveformBar,
                  { height: mult * 4 },
                  idx <= playedBars ? styles.barPlayed : styles.barUnplayed,
                ]}
              />
            ))}
          </View>

          {/* Time labels */}
          <View style={styles.timeLabelsRow}>
            <Text style={styles.timeLabel}>{msToTime(positionMs)}</Text>
            <Text style={styles.timeLabel}>
              {durationMs > 0 ? msToTime(durationMs) : params.duration ?? "--"}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <Pressable
              style={styles.secondaryButton}
              onPress={handleSkipBack}
              accessibilityRole="button"
              accessibilityLabel="Rewind 15 seconds"
            >
              <SkipBackIcon />
            </Pressable>

            <Pressable
              style={[styles.playButton, !isLoaded && styles.playButtonDisabled]}
              onPress={togglePlayPause}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={handleSkipForward}
              accessibilityRole="button"
              accessibilityLabel="Skip 15 seconds"
            >
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonPlaceholder: { width: 44 },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    textAlign: "center",
    marginHorizontal: Spacing.sm,
  },
  imageContainer: {
    height: SCREEN_HEIGHT * 0.42,
    marginTop: -20,
  },
  illustration: {
    width: "100%",
    height: "100%",
    opacity: 0.95,
  },
  bottomSheetWrapper: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    position: "relative",
    marginTop: -40,
  },
  hugeCircleBackground: {
    position: "absolute",
    top: 0,
    width: 1000,
    height: 1000,
    borderRadius: 500,
    backgroundColor: Colors.primaryLight,
  },
  arcContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
  },
  playerContent: {
    width: "100%",
    alignItems: "center",
    paddingTop: 85,
    paddingHorizontal: 30,
    zIndex: 2,
  },
  timerPill: {
    backgroundColor: Colors.card,
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
    fontFamily: Typography.fontFamily,
    minWidth: 70,
    textAlign: "center",
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
  barPlayed: { backgroundColor: Colors.primary },
  barUnplayed: { backgroundColor: Colors.textTertiary, opacity: 0.4 },
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
    backgroundColor: Colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
