import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { FontSize, FontWeight, Typography } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useVoiceJournal, type DetectedMood } from "@/hooks/useVoiceJournal";
import type { JournalEntry } from "@/hooks/useJournal";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface JournalEditorProps {
  visible: boolean;
  /** Existing entry to edit, or null to create a new one. */
  entry: JournalEntry | null;
  /** Whether to start in voice mode. */
  voiceMode?: boolean;
  saving: boolean;
  onSave: (title: string, content: string) => void;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.88;

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */

const MicIcon = ({ size = 32, color = "#FFF" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z"
      fill={color}
    />
    <Path
      d="M19 10v2a7 7 0 0 1-14 0v-2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 19v4M8 23h8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StopIcon = ({ size = 20, color = "#FFF" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={5} y={5} width={14} height={14} rx={2} fill={color} />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Mood badge config
 * ────────────────────────────────────────────────────────── */

const MOOD_CONFIG: Record<DetectedMood, { emoji: string; label: string; color: string }> = {
  awful: { emoji: "😢", label: "Awful", color: "#E53935" },
  bad: { emoji: "😔", label: "Bad", color: "#FB8C00" },
  okay: { emoji: "😐", label: "Okay", color: "#9E9E9E" },
  good: { emoji: "😊", label: "Good", color: "#43A047" },
  great: { emoji: "🤩", label: "Great", color: "#2E7D32" },
};

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

/** Format milliseconds as MM:SS */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const JournalEditor: React.FC<JournalEditorProps> = ({
  visible,
  entry,
  voiceMode: initialVoiceMode = false,
  saving,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  /* ── Voice recording state ─────────────────────────────── */
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [detectedMood, setDetectedMood] = useState<DetectedMood | null>(null);

  const voiceRecorder = useVoiceRecorder();
  const voiceJournal = useVoiceJournal();

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const contentRef = useRef<TextInput>(null);

  /* ── Keyboard tracking ──────────────────────────────────── */
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: KeyboardEvent) => setKeyboardHeight(e.endCoordinates.height);
    const onHide = () => setKeyboardHeight(0);

    const sub1 = Keyboard.addListener(showEvent, onShow);
    const sub2 = Keyboard.addListener(hideEvent, onHide);

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  /* ── Populate fields when entry changes ─────────────────── */
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [entry]);

  /* ── Set voice mode when prop changes ───────────────────── */
  useEffect(() => {
    if (visible) {
      setIsVoiceMode(initialVoiceMode);
      setDetectedMood(null);
    }
  }, [visible, initialVoiceMode]);

  /* ── Reset state when editor closes ─────────────────────── */
  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      setIsVoiceMode(false);
      setDetectedMood(null);
      Keyboard.dismiss();
    }
  }, [visible]);

  /* ── Slide-in/out animation ─────────────────────────────── */
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  /* ── Pulsing animation for recording indicator ──────────── */
  useEffect(() => {
    if (voiceRecorder.isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [voiceRecorder.isRecording]);

  /* ── Voice recording handlers ───────────────────────────── */

  const handleStartRecording = useCallback(async () => {
    Keyboard.dismiss();
    await voiceRecorder.start();
  }, [voiceRecorder]);

  const handleStopRecording = useCallback(async () => {
    const result = await voiceRecorder.stop();
    if (!result) return;

    // Send audio to backend for transcription
    try {
      const { entry: aiEntry, mood } = await voiceJournal.mutateAsync({
        audio: result.audioBase64,
      });

      // Populate the text fields with AI-generated content
      setTitle(aiEntry.title);
      setContent(aiEntry.content);
      setDetectedMood(mood);

      // Switch to text mode so user can review & edit
      setIsVoiceMode(false);
    } catch {
      // Error is handled by the mutation hook
    }
  }, [voiceRecorder, voiceJournal]);

  const handleClose = useCallback(() => {
    // Stop recording if active before closing
    if (voiceRecorder.isRecording) {
      voiceRecorder.stop();
    }
    Keyboard.dismiss();
    onClose();
  }, [voiceRecorder, onClose]);

  /* ── Derived state ──────────────────────────────────────── */
  const isValid = title.trim().length > 0 && content.trim().length > 0;
  const isEditing = entry !== null;
  const isProcessing = voiceJournal.isPending;

  const handleSave = () => {
    if (!isValid || saving) return;
    onSave(title.trim(), content.trim());
  };

  const scrollContentPadding = keyboardHeight > 0 ? keyboardHeight + Spacing.base : Spacing.xl;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Bottom sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Entry" : isVoiceMode ? "Voice Entry" : "New Entry"}
          </Text>

          <Pressable
            onPress={handleSave}
            style={styles.headerButton}
            disabled={!isValid || saving || isVoiceMode}
          >
            <Text
              style={[
                styles.saveText,
                (!isValid || saving || isVoiceMode) && styles.saveTextDisabled,
              ]}
            >
              {saving ? "Saving…" : "Save"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* ── Voice recording view ─────────────────────────── */}
        {isVoiceMode ? (
          <View style={styles.voiceContainer}>
            {isProcessing ? (
              /* ── Processing state ───────────────────────── */
              <View style={styles.voiceCentered}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.voiceStatusText}>
                  Transcribing your thoughts…
                </Text>
                <Text style={styles.voiceHintText}>
                  Gemini is cleaning and analyzing your entry
                </Text>
              </View>
            ) : (
              /* ── Recording state ────────────────────────── */
              <View style={styles.voiceCentered}>
                {/* Timer */}
                <Text style={styles.voiceTimer}>
                  {formatDuration(voiceRecorder.durationMs)}
                </Text>

                {/* Recording indicator text */}
                <Text style={styles.voiceStatusText}>
                  {voiceRecorder.isRecording
                    ? "Listening…"
                    : "Tap the mic to start recording"}
                </Text>

                {/* Mic / Stop button */}
                <Animated.View
                  style={[
                    styles.micButtonWrapper,
                    voiceRecorder.isRecording && {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <Pressable
                    style={[
                      styles.micButton,
                      voiceRecorder.isRecording && styles.micButtonRecording,
                    ]}
                    onPress={
                      voiceRecorder.isRecording
                        ? handleStopRecording
                        : handleStartRecording
                    }
                    accessibilityRole="button"
                    accessibilityLabel={
                      voiceRecorder.isRecording
                        ? "Stop recording"
                        : "Start recording"
                    }
                  >
                    {voiceRecorder.isRecording ? (
                      <StopIcon size={28} />
                    ) : (
                      <MicIcon size={32} />
                    )}
                  </Pressable>
                </Animated.View>

                {/* Hint */}
                <Text style={styles.voiceHintText}>
                  {voiceRecorder.isRecording
                    ? "Tap stop when you're done"
                    : "Speak naturally — AI will clean and format your entry"}
                </Text>

                {/* Switch to text mode */}
                {!voiceRecorder.isRecording && (
                  <Pressable
                    style={styles.switchModeButton}
                    onPress={() => setIsVoiceMode(false)}
                  >
                    <Text style={styles.switchModeText}>Switch to typing</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        ) : (
          /* ── Text editing view (original) ─────────────── */
          <>
            {/* Detected mood badge */}
            {detectedMood && (
              <View style={styles.moodBadgeContainer}>
                <View
                  style={[
                    styles.moodBadge,
                    { backgroundColor: MOOD_CONFIG[detectedMood].color + "18" },
                  ]}
                >
                  <Text style={styles.moodEmoji}>
                    {MOOD_CONFIG[detectedMood].emoji}
                  </Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      { color: MOOD_CONFIG[detectedMood].color },
                    ]}
                  >
                    {MOOD_CONFIG[detectedMood].label} mood detected
                  </Text>
                </View>
              </View>
            )}

            <ScrollView
              style={styles.body}
              contentContainerStyle={{ paddingBottom: scrollContentPadding }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets
            >
              <TextInput
                style={styles.titleInput}
                placeholder="Entry title…"
                placeholderTextColor={Colors.textTertiary}
                value={title}
                onChangeText={setTitle}
                maxLength={200}
                returnKeyType="next"
                onSubmitEditing={() => contentRef.current?.focus()}
              />

              <View style={styles.contentDivider} />

              <TextInput
                ref={contentRef}
                style={styles.contentInput}
                placeholder="Write your thoughts…"
                placeholderTextColor={Colors.textTertiary}
                value={content}
                onChangeText={setContent}
                multiline
                scrollEnabled={false}
                textAlignVertical="top"
                maxLength={10000}
              />
            </ScrollView>

            {/* Footer: char count + optional mic toggle */}
            {keyboardHeight === 0 && (
              <View style={styles.footer}>
                {!isEditing && (
                  <Pressable
                    style={styles.footerMicButton}
                    onPress={() => setIsVoiceMode(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Switch to voice recording"
                  >
                    <MicIcon size={18} color={Colors.primary} />
                    <Text style={styles.footerMicText}>Voice</Text>
                  </Pressable>
                )}
                <Text style={styles.charCount}>
                  {content.length} / 10,000
                </Text>
              </View>
            )}
          </>
        )}
      </Animated.View>
    </Modal>
  );
};

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  headerButton: {
    minWidth: 64,
  },
  headerTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
  },
  saveText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    textAlign: "right",
    fontFamily: Typography.fontFamily,
  },
  saveTextDisabled: {
    color: Colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },

  /* ── Text editing ────────────────────────────────────── */
  body: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  titleInput: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  contentDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  contentInput: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    lineHeight: 24,
    paddingVertical: Spacing.sm,
    minHeight: 200,
  },

  /* ── Footer ──────────────────────────────────────────── */
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  footerMicButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.primary + "12",
  },
  footerMicText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    fontFamily: Typography.fontFamily,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: "right",
    marginLeft: "auto",
  },

  /* ── Voice recording ────────────────────────────────── */
  voiceContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  voiceCentered: {
    alignItems: "center",
    gap: Spacing.base,
  },
  voiceTimer: {
    fontSize: 48,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    letterSpacing: 2,
  },
  voiceStatusText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    textAlign: "center",
  },
  voiceHintText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily,
    textAlign: "center",
    maxWidth: 280,
  },
  micButtonWrapper: {
    marginVertical: Spacing.lg,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  micButtonRecording: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
  },
  switchModeButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  switchModeText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    fontFamily: Typography.fontFamily,
    textDecorationLine: "underline",
  },

  /* ── Mood badge ──────────────────────────────────────── */
  moodBadgeContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  moodBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    fontFamily: Typography.fontFamily,
  },
});
