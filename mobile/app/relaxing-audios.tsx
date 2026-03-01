import React from "react";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import { AudioList } from "@/components/home/AudioList";
import { useAudioByCategory } from "@/hooks/useAudio";
import { useDataStore } from "@/stores/useDataStore";
import { Colors } from "@/constants/colors";

export default function RelaxingAudiosScreen() {
  // Instant synchronous data from last successful fetch (no spinner)
  const cachedTracks = useDataStore((s) => s.relaxingTracks);

  const { data: tracks, isLoading, isError } = useAudioByCategory("relaxing");

  // Show Zustand cache while TanStack re-validates. Spinner only if
  // both TanStack is loading AND the cache is completely empty.
  const displayTracks = tracks ?? (cachedTracks.length > 0 ? cachedTracks : null);
  const displayLoading = isLoading && !displayTracks;

  if (displayLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError && !displayTracks) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load audio tracks.</Text>
      </View>
    );
  }

  const mapped = (displayTracks ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    duration: t.duration,
    author: "",
    audioUrl: t.audioUrl,
  }));

  return (
    <AudioList
      title="Relaxing Audios"
      subtitle="Calm your mind and reset"
      tracks={mapped}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
