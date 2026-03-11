import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { FontSize, FontWeight, Typography } from "@/constants/typography";
import { Spacing } from "@/constants/spacing";
import { useVoiceCall } from "@/hooks/useVoiceCall";

const { width } = Dimensions.get("window");
const pandaBg = require("@/assets/images/panda.jpg");

/* ──────────────────────────────────────────────────────────
 * Components
 * ────────────────────────────────────────────────────────── */

const Waveform = ({ active }: { active: boolean }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(withTiming(1.2, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1);
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [1, 1.2], [0.3, 0.1]),
  }));

  return (
    <View style={styles.waveformContainer}>
      <Animated.View style={[styles.waveCircle, animatedStyle, { width: 200, height: 200, borderRadius: 100 }]} />
      <Animated.View style={[styles.waveCircle, animatedStyle, { width: 160, height: 160, borderRadius: 80 }]} />
      <View style={styles.centerCircle}>
        <Text style={styles.emoji}>🤖</Text>
      </View>
    </View>
  );
};

/* ──────────────────────────────────────────────────────────
 * Screen
 * ────────────────────────────────────────────────────────── */

export default function VoiceCallScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isCalling, isConnecting, isMuted, setIsMuted, error, startCall, stopCall } = useVoiceCall();
  const [timer, setTimer] = useState(0);

  // Auto-start the call when the screen mounts
  useEffect(() => {
    startCall();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isCalling) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    stopCall();
    router.back();
  };

  const statusLabel = error
    ? "Error connecting"
    : isCalling
      ? "On Call"
      : isConnecting
        ? "Connecting..."
        : "Ready";

  return (
    <ImageBackground source={pandaBg} style={styles.container} resizeMode="cover">
      <StatusBar style="light" />
      
      {/* Dark Overlay */}
      <View style={styles.overlay} />

      <View style={[styles.content, { paddingTop: insets.top + Spacing.xl }]}>
        <Text style={styles.title}>Moody AI Voice</Text>
        <Text style={styles.status}>{statusLabel}</Text>
        
        {isCalling && <Text style={styles.timer}>{formatTime(timer)}</Text>}

        <View style={styles.main}>
          <Waveform active={isCalling} />
          {error && <Text style={styles.errorMessage}>{error}</Text>}
        </View>

        <View style={[styles.controls, { paddingBottom: insets.bottom + Spacing.xxl }]}>
          <Pressable
            style={[styles.circleButton, isMuted && styles.mutedButton]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Text style={styles.buttonLabel}>{isMuted ? "🔇" : "🎙️"}</Text>
          </Pressable>

          <Pressable style={styles.endCallButton} onPress={handleEndCall}>
            <Text style={styles.endCallEmoji}>📞</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: "#FFFFFF",
    fontFamily: Typography.fontFamily,
  },
  status: {
    fontSize: FontSize.md,
    color: "#A0A0A0",
    marginTop: Spacing.xs,
    fontFamily: Typography.fontFamily,
  },
  timer: {
    fontSize: FontSize.lg,
    color: "#FFFFFF",
    marginTop: Spacing.sm,
    fontFamily: Typography.fontFamily,
  },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  waveformContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 250,
    height: 250,
  },
  waveCircle: {
    position: "absolute",
    backgroundColor: Colors.primary,
  },
  centerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  emoji: {
    fontSize: 40,
  },
  errorMessage: {
    color: Colors.error,
    marginTop: Spacing.xl,
    textAlign: "center",
    fontFamily: Typography.fontFamily,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.massive,
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },
  mutedButton: {
    backgroundColor: Colors.error,
  },
  buttonLabel: {
    fontSize: 24,
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "135deg" }],
  },
  endCallEmoji: {
    fontSize: 32,
    color: "#FFFFFF",
  },
});
