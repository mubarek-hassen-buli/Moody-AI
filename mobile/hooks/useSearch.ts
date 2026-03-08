import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { JOURNAL_KEYS, type JournalEntry } from "./useJournal";
import { AUDIO_KEYS, type AudioTrackData } from "./useAudio";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export interface SearchResults {
  journals: JournalEntry[];
  audioTracks: AudioTrackData[];
  totalCount: number;
}

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

/** Case-insensitive substring match. */
function matches(text: string | null | undefined, query: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(query);
}

/* ──────────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────────── */

/**
 * Client-side search across journals and audio tracks.
 * Reads from TanStack Query cache when available, otherwise fetches.
 * Returns filtered results grouped by category.
 */
export function useSearch(query: string): SearchResults & { isLoading: boolean } {
  // Fetch (or read from cache) the full datasets
  const { data: journals = [], isLoading: journalsLoading } = useQuery<JournalEntry[]>({
    queryKey: JOURNAL_KEYS.all,
    queryFn: async () => {
      const { data } = await api.get("/journal");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: relaxingAudio = [], isLoading: relaxingLoading } = useQuery<AudioTrackData[]>({
    queryKey: AUDIO_KEYS.byCategory("relaxing"),
    queryFn: async () => {
      const { data } = await api.get("/audio/relaxing");
      return data.data;
    },
    staleTime: 30 * 60 * 1000,
  });

  const { data: workoutAudio = [], isLoading: workoutLoading } = useQuery<AudioTrackData[]>({
    queryKey: AUDIO_KEYS.byCategory("workout"),
    queryFn: async () => {
      const { data } = await api.get("/audio/workout");
      return data.data;
    },
    staleTime: 30 * 60 * 1000,
  });

  const isLoading = journalsLoading || relaxingLoading || workoutLoading;

  // Filter results — only compute when query or data changes
  const results = useMemo<SearchResults>(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return { journals: [], audioTracks: [], totalCount: 0 };
    }

    const filteredJournals = journals.filter(
      (j) => matches(j.title, q) || matches(j.content, q),
    );

    const allAudio = [...relaxingAudio, ...workoutAudio];
    const filteredAudio = allAudio.filter(
      (a) => matches(a.title, q) || matches(a.category, q),
    );

    return {
      journals: filteredJournals,
      audioTracks: filteredAudio,
      totalCount: filteredJournals.length + filteredAudio.length,
    };
  }, [query, journals, relaxingAudio, workoutAudio]);

  return { ...results, isLoading };
}
