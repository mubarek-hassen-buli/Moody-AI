import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { JournalEntryCard } from "@/components/journal/JournalEntryCard";
import { JournalEditor } from "@/components/journal/JournalEditor";
import { CustomDeleteModal } from "@/components/journal/CustomDeleteModal";
import { Colors } from "@/constants/colors";
import { Typography, FontSize, FontWeight } from "@/constants/typography";
import { Spacing, SCREEN_PADDING } from "@/constants/spacing";
import {
  useJournalEntries,
  useCreateJournal,
  useUpdateJournal,
  useDeleteJournal,
  type JournalEntry,
} from "@/hooks/useJournal";
import { useDataStore } from "@/stores/useDataStore";

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

export default function JournalScreen() {
  const insets = useSafeAreaInsets();

  // ── Data ──────────────────────────────────────────────────
  const cachedEntries = useDataStore((s) => s.journalEntries);
  const { data: entries, isLoading, isError, refetch } = useJournalEntries();

  // Zustand cache as instant fallback — spinner only on very first launch
  const displayEntries = entries ?? (cachedEntries.length > 0 ? cachedEntries : null);
  const displayLoading = isLoading && !displayEntries;

  const createJournal = useCreateJournal();
  const updateJournal = useUpdateJournal();
  const deleteJournal = useDeleteJournal();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // ── Editor modal state ────────────────────────────────────
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);

  // ── Delete modal state ────────────────────────────────────
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<JournalEntry | null>(null);

  /* ── Handlers ──────────────────────────────────────────── */

  const handleNewEntry = useCallback(() => {
    setEditingEntry(null);
    setVoiceMode(false);
    setEditorVisible(true);
  }, []);

  const handleVoiceEntry = useCallback(() => {
    setEditingEntry(null);
    setVoiceMode(true);
    setEditorVisible(true);
  }, []);

  const handleEditEntry = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditorVisible(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setEditorVisible(false);
    setEditingEntry(null);
  }, []);

  const handleSave = useCallback(
    (title: string, content: string) => {
      if (editingEntry) {
        updateJournal.mutate(
          { id: editingEntry.id, title, content },
          { onSuccess: handleCloseEditor },
        );
      } else {
        createJournal.mutate(
          { title, content },
          { onSuccess: handleCloseEditor },
        );
      }
    },
    [editingEntry, createJournal, updateJournal, handleCloseEditor],
  );

  const handleDeleteRequest = useCallback((entry: JournalEntry) => {
    setDeletingEntry(entry);
    setDeleteModalVisible(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteModalVisible(false);
    setDeletingEntry(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deletingEntry) {
      deleteJournal.mutate(deletingEntry.id, {
        onSuccess: () => {
          setDeleteModalVisible(false);
          setDeletingEntry(null);
        },
      });
    }
  }, [deletingEntry, deleteJournal]);

  /* ── Render ────────────────────────────────────────────── */

  const isSaving = createJournal.isPending || updateJournal.isPending;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* ── Header ──────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View>
          <Text style={styles.heading}>Journal</Text>
          <Text style={styles.subtitle}>Your personal mood diary</Text>
        </View>

        {/* Entry buttons */}
        <View style={styles.headerButtons}>
          <Pressable
            onPress={handleVoiceEntry}
            style={({ pressed }) => [
              styles.voiceButton,
              pressed && styles.newButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Voice journal entry"
          >
            <Text style={styles.voiceButtonText}>🎙️ Voice</Text>
          </Pressable>

          <Pressable
            onPress={handleNewEntry}
            style={({ pressed }) => [
              styles.newButton,
              pressed && styles.newButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="New journal entry"
          >
            <Text style={styles.newButtonText}>+ New</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Body ─────────────────────────────────────────── */}
      {displayLoading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {isError && !displayEntries && (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyText}>Could not load entries.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!displayLoading && !isError && displayEntries?.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No entries yet</Text>
          <Text style={styles.emptyText}>
            Start writing to capture your thoughts and feelings.
          </Text>
        </View>
      )}

      {!displayLoading && displayEntries && displayEntries.length > 0 && (
        <FlatList
          data={displayEntries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <JournalEntryCard
              entry={item}
              onEdit={handleEditEntry}
              onDelete={handleDeleteRequest}
              style={styles.card}
            />
          )}
        />
      )}

      {/* ── Editor modal ──────────────────────────────────── */}
      <JournalEditor
        visible={editorVisible}
        entry={editingEntry}
        voiceMode={voiceMode}
        saving={isSaving}
        onSave={handleSave}
        onClose={handleCloseEditor}
      />

      {/* ── Delete confirmation modal ─────────────────────── */}
      <CustomDeleteModal
        visible={deleteModalVisible}
        dateString={deletingEntry ? deletingEntry.createdAt.slice(0, 10).replace(/-/g, "/") : ""}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
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
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: SCREEN_PADDING,
    paddingBottom: Spacing.base,
  },
  heading: {
    ...Typography.hero,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  newButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  newButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  newButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  voiceButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  voiceButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Spacing.sm,
    paddingBottom: 120,
  },
  card: {
    marginBottom: Spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SCREEN_PADDING,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  retryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textInverse,
  },
});
