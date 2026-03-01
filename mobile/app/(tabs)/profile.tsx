import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";

import { Colors } from "@/constants/colors";
import { FontSize, FontWeight, Typography } from "@/constants/typography";
import { BorderRadius, SCREEN_PADDING, Spacing } from "@/constants/spacing";
import { useAuthStore } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

/* ──────────────────────────────────────────────────────────
 * Icons
 * ────────────────────────────────────────────────────────── */

const EditIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      stroke={Colors.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={Colors.textSecondary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18L15 12L9 6"
      stroke={Colors.textTertiary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UserIcon = () => (
  <Svg width={44} height={44} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={Colors.textTertiary} strokeWidth={1.5} />
    <Path
      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
      stroke={Colors.textTertiary}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

/* ──────────────────────────────────────────────────────────
 * Sub-components
 * ────────────────────────────────────────────────────────── */

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  value,
  onPress,
  rightElement,
  isLast,
}) => (
  <Pressable
    style={[styles.settingsRow, !isLast && styles.settingsRowBorder]}
    onPress={onPress}
    disabled={!onPress}
  >
    <Text style={styles.settingsLabel}>{label}</Text>
    <View style={styles.settingsRight}>
      {rightElement ?? (
        <>
          {value && <Text style={styles.settingsValue}>{value}</Text>}
          {onPress && <ChevronIcon />}
        </>
      )}
    </View>
  </Pressable>
);

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const signOut = useAuthStore((s) => s.signOut);
  const signOutLoading = useAuthStore((s) => s.loading);

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { mutate: updateName, isPending: updating } = useUpdateProfile();

  // ── Local UI state ────────────────────────────────────────
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // ── Edit name modal state ─────────────────────────────────
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [draftName, setDraftName] = useState("");

  const openEditModal = () => {
    setDraftName(profile?.name ?? "");
    setEditModalVisible(true);
  };

  const handleSaveName = () => {
    if (!draftName.trim()) return;
    updateName(
      { name: draftName.trim() },
      { onSuccess: () => setEditModalVisible(false) }
    );
  };

  // ── Sign-out confirmation ────────────────────────────────
  const handleSignOut = () => {
    Alert.alert(
      "Sign out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => signOut(),
        },
      ]
    );
  };

  // ── Derived display values ────────────────────────────────
  const displayName = profile?.name ?? "Moody User";
  const displayEmail = profile?.email ?? "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* ── Header ──────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable
          style={styles.editIconButton}
          onPress={openEditModal}
          accessibilityRole="button"
          accessibilityLabel="Edit profile name"
        >
          <EditIcon />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar & Identity ──────────────────────────────── */}
        <View style={styles.avatarSection}>
          {profileLoading ? (
            <ActivityIndicator
              size="large"
              color={Colors.primary}
              style={styles.avatarLoader}
            />
          ) : (
            <View style={styles.avatarCircle}>
              {displayName ? (
                <Text style={styles.avatarInitials}>{initials}</Text>
              ) : (
                <UserIcon />
              )}
            </View>
          )}
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{displayEmail}</Text>
        </View>

        {/* ── Wellness Settings ──────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wellness settings</Text>
          <View style={styles.card}>
            <SettingsRow
              label="Push notifications"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: Colors.borderLight, true: Colors.primary }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingsRow
              label="Daily reminder time"
              value="8:00 AM"
              onPress={() => {}} // TODO: time picker in Phase 7
              isLast
            />
          </View>
        </View>

        {/* ── Account Settings ───────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <SettingsRow
              label="Display name"
              value={profile?.name ?? "Not set"}
              onPress={openEditModal}
            />
            <SettingsRow
              label="Email"
              value={displayEmail}
            />
            <SettingsRow
              label="Clear chat history"
              onPress={() =>
                Alert.alert(
                  "Clear chat history",
                  "This will permanently delete all your AI conversation history.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Clear", style: "destructive", onPress: () => {} },
                  ]
                )
              }
              isLast
            />
          </View>
        </View>

        {/* ── App Info ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.card}>
            <SettingsRow label="Version" value="1.0.0" />
            <SettingsRow
              label="Privacy policy"
              onPress={() => {}}
            />
            <SettingsRow
              label="Terms of service"
              onPress={() => {}}
              isLast
            />
          </View>
        </View>

        {/* ── Sign out ──────────────────────────────────────── */}
        <Pressable
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={signOutLoading}
        >
          {signOutLoading ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Text style={styles.signOutText}>Sign out</Text>
          )}
        </Pressable>
      </ScrollView>

      {/* ── Edit Name Modal ─────────────────────────────────── */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Edit display name</Text>
            <TextInput
              style={styles.modalInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Your name"
              placeholderTextColor={Colors.textTertiary}
              autoFocus
              maxLength={100}
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalSave,
                  (!draftName.trim() || updating) && styles.modalSaveDisabled,
                ]}
                onPress={handleSaveName}
                disabled={!draftName.trim() || updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    justifyContent: "space-between",
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerSpacer: { width: 36 },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
  editIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Spacing.xxl,
  },

  /* Avatar section */
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  avatarLoader: {
    width: 88,
    height: 88,
    marginBottom: Spacing.base,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.base,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: FontWeight.bold,
    color: Colors.primaryDark,
    fontFamily: Typography.fontFamily,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
  },

  /* Sections */
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },

  /* Settings rows */
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    minHeight: 52,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  settingsLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    flex: 1,
  },
  settingsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  settingsValue: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily,
  },

  /* Sign out */
  signOutButton: {
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  signOutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
    fontFamily: Typography.fontFamily,
  },

  /* Edit name modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: "100%",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    marginBottom: Spacing.base,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    marginBottom: Spacing.base,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
  },
  modalSave: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSaveDisabled: {
    opacity: 0.45,
  },
  modalSaveText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
    fontFamily: Typography.fontFamily,
  },
});
