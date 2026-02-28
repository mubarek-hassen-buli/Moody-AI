import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
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
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const contentRef = useRef<TextInput>(null);

  // Populate fields when editing an existing entry
  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [entry]);

  // Slide-in animation
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

  const isValid = title.trim().length > 0 && content.trim().length > 0;
  const isEditing = entry !== null;

  const handleSave = () => {
    if (!isValid || saving) return;
    onSave(title.trim(), content.trim());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flex}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.headerButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>
              {isEditing ? "Edit Entry" : "New Entry"}
            </Text>
            <Pressable
              onPress={handleSave}
              style={[styles.headerButton, (!isValid || saving) && styles.saveButtonDisabled]}
              disabled={!isValid || saving}
            >
              <Text style={[styles.saveText, (!isValid || saving) && styles.saveTextDisabled]}>
                {saving ? "Saving…" : "Save"}
              </Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Form */}
          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
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
              textAlignVertical="top"
              maxLength={10000}
            />
          </ScrollView>

          {/* Character count */}
          <Text style={styles.charCount}>{content.length} / 10,000</Text>
        </KeyboardAvoidingView>
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
    height: SCREEN_HEIGHT * 0.88,
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  flex: {
    flex: 1,
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  titleInput: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    paddingVertical: Spacing.sm,
    minHeight: 44,
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
    minHeight: 300,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: "right",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
});
