import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export type AudioCategory = "relaxing" | "workout";

export interface AudioTrackData {
  id: string;
  title: string;
  duration: string;
  category: AudioCategory;
  audioUrl: string;
}

/* ──────────────────────────────────────────────────────────
 * Query keys
 * ────────────────────────────────────────────────────────── */

export const AUDIO_KEYS = {
  all: ["audio"] as const,
  byCategory: (category: AudioCategory) => ["audio", category] as const,
};

/* ──────────────────────────────────────────────────────────
 * Hooks
 * ────────────────────────────────────────────────────────── */

/** Fetch audio tracks filtered by category. */
export function useAudioByCategory(category: AudioCategory) {
  return useQuery<AudioTrackData[]>({
    queryKey: AUDIO_KEYS.byCategory(category),
    queryFn: async () => {
      const { data } = await api.get(`/audio/${category}`);
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes — audio list rarely changes
  });
}
