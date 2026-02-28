import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { BorderRadius, Spacing } from "@/constants/spacing";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

interface CustomDeleteModalProps {
  visible: boolean;
  dateString: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */

const QuestionIcon = () => (
  <View style={styles.iconCircle}>
    <Text style={styles.questionMark}>?</Text>
  </View>
);

const TrashIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </Svg>
);

const CrossIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={Colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6L6 18M6 6l12 12" />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export const CustomDeleteModal: React.FC<CustomDeleteModalProps> = ({
  visible,
  dateString,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <QuestionIcon />

          <Text style={styles.title}>
            Delete Mental Health{"\n"}Journal?
          </Text>

          <Text style={styles.subtitle}>
            Are you sure to delete your mental{"\n"}health journal on {dateString}?
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.buttonPressed]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
              <CrossIcon />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.button, styles.deleteButton, pressed && styles.buttonPressed]}
              onPress={onConfirm}
            >
              <Text style={styles.deleteText}>Delete</Text>
              <TrashIcon />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ──────────────────────────────────────────────────────────
 * Styles
 * ────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  dialog: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  questionMark: {
    fontSize: 28,
    color: Colors.textSecondary,
    fontWeight: "300",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4A3B32", // Match the dark brown in the design
    textAlign: "center",
    fontFamily: Typography.fontFamily,
    marginBottom: Spacing.md,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
    fontFamily: Typography.fontFamily,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 24,
    gap: Spacing.xs,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cancelButton: {
    backgroundColor: "#F8F5F3",
  },
  cancelText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: "#BCAAA4",
    fontFamily: Typography.fontFamily,
  },
  deleteButton: {
    backgroundColor: "#E67E22", // A vibrant orange
  },
  deleteText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: "#FFFFFF",
    fontFamily: Typography.fontFamily,
  },
});
