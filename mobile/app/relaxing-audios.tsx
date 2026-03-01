import React from "react";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import { AudioList } from "@/components/home/AudioList";
import { useAudioByCategory } from "@/hooks/useAudio";
import { Colors } from "@/constants/colors";

export default function RelaxingAudiosScreen() {
  const { data: tracks, isLoading, isError } = useAudioByCategory("relaxing");

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !tracks) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load audio tracks.</Text>
      </View>
    );
  }

  // Map from API shape to the shape AudioList expects
  const mapped = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    duration: t.duration,
    author: "",          // Author intentionally omitted per product decision
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
