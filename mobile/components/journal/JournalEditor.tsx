import React, { useEffect, useRef, useState } from "react";
import {
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
import { Colors } from "@/constants/colors";
import { FontSize, FontWeight, Typography } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";
import type { JournalEntry } from "@/hooks/useJournal";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface JournalEditorProps {
  visible: boolean;
  /** Existing entry to edit, or null to create a new one. */
  entry: JournalEntry | null;
  saving: boolean;
  onSave: (title: string, content: string) => void;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.88;

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const JournalEditor: React.FC<JournalEditorProps> = ({
  visible,
  entry,
  saving,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const contentRef = useRef<TextInput>(null);

  /* ── Keyboard tracking ──────────────────────────────────── */
  // Manually track keyboard height so content stays visible.
  // KeyboardAvoidingView is unreliable inside absolute-positioned Modals.
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

  /* ── Reset keyboard offset when editor closes ───────────── */
  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
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

  /* ── Derived state ──────────────────────────────────────── */
  const isValid = title.trim().length > 0 && content.trim().length > 0;
  const isEditing = entry !== null;

  const handleSave = () => {
    if (!isValid || saving) return;
    onSave(title.trim(), content.trim());
  };

  /* ── Scroll content area height accounts for keyboard ────── */
  // Subtract keyboard height so the input is always above the keyboard.
  const scrollContentPadding = keyboardHeight > 0 ? keyboardHeight + Spacing.base : Spacing.xl;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      />

      {/* Bottom sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* ── Header ───────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={() => { Keyboard.dismiss(); onClose(); }} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Entry" : "New Entry"}
          </Text>

          <Pressable
            onPress={handleSave}
            style={styles.headerButton}
            disabled={!isValid || saving}
          >
            <Text style={[styles.saveText, (!isValid || saving) && styles.saveTextDisabled]}>
              {saving ? "Saving…" : "Save"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* ── Scrollable form ────────────────────────────────
         *   paddingBottom grows with the keyboard so the focused
         *   input is never hidden behind it.
         * ──────────────────────────────────────────────────── */}
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
            scrollEnabled={false}   // let the outer ScrollView scroll
            textAlignVertical="top"
            maxLength={10000}
          />
        </ScrollView>

        {/* ── Footer: char count (hidden when keyboard is up) ── */}
        {keyboardHeight === 0 && (
          <Text style={styles.charCount}>{content.length} / 10,000</Text>
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
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: "right",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
});
