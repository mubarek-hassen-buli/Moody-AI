import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { useDataStore } from "@/stores/useDataStore";

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
 * Hook
 * ────────────────────────────────────────────────────────── */

/**
 * Fetch audio tracks for a given category.
 *
 * On success, writes the result to the Zustand data store so
 * subsequent navigations to the screen see data instantly,
 * even before TanStack's cache is re-validated.
 */
export function useAudioByCategory(category: AudioCategory) {
  const setRelaxing = useDataStore((s) => s.setRelaxingTracks);
  const setWorkout = useDataStore((s) => s.setWorkoutTracks);

  return useQuery<AudioTrackData[]>({
    queryKey: AUDIO_KEYS.byCategory(category),
    queryFn: async () => {
      const { data } = await api.get(`/audio/${category}`);
      return data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes — audio list rarely changes
    select: (tracks) => {
      // Write to Zustand store on every successful fetch
      if (category === "relaxing") setRelaxing(tracks);
      else setWorkout(tracks);
      return tracks;
    },
  });
}
