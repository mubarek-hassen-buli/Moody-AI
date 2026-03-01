import { create } from "zustand";
import type { AudioTrackData } from "@/hooks/useAudio";
import type { JournalEntry } from "@/hooks/useJournal";
import type { WeeklyDay, MoodStats } from "@/hooks/useMood";

/* ──────────────────────────────────────────────────────────
 * State shape
 * ────────────────────────────────────────────────────────── */

interface DataState {
  /** Relaxing audio tracks (category: relaxing) */
  relaxingTracks: AudioTrackData[];
  /** Workout audio tracks (category: workout) */
  workoutTracks: AudioTrackData[];
  /** Journal entries for the current user */
  journalEntries: JournalEntry[];
  /** Last 7 days of mood scores for the line chart */
  weeklyMoods: WeeklyDay[];
  /** Emotion breakdown stats for the donut chart */
  moodStats: MoodStats | null;
}

interface DataActions {
  setRelaxingTracks: (tracks: AudioTrackData[]) => void;
  setWorkoutTracks: (tracks: AudioTrackData[]) => void;
  setJournalEntries: (entries: JournalEntry[]) => void;
  setWeeklyMoods: (moods: WeeklyDay[]) => void;
  setMoodStats: (stats: MoodStats) => void;
  /** Clear all cached data (called on logout) */
  clearAll: () => void;
}

const initialState: DataState = {
  relaxingTracks: [],
  workoutTracks: [],
  journalEntries: [],
  weeklyMoods: [],
  moodStats: null,
};

/* ──────────────────────────────────────────────────────────
 * Store
 *
 * This is a pure in-memory store. It acts as a synchronous
 * instant-read layer on top of TanStack Query. When TanStack
 * fetches fresh data it writes here via `onSuccess`; screens
 * read from here first so they never show a spinner unless
 * the store is completely empty (first ever launch).
 * ────────────────────────────────────────────────────────── */

export const useDataStore = create<DataState & DataActions>((set) => ({
  ...initialState,

  setRelaxingTracks: (tracks) => set({ relaxingTracks: tracks }),
  setWorkoutTracks: (tracks) => set({ workoutTracks: tracks }),
  setJournalEntries: (entries) => set({ journalEntries: entries }),
  setWeeklyMoods: (moods) => set({ weeklyMoods: moods }),
  setMoodStats: (stats) => set({ moodStats: stats }),

  clearAll: () => set(initialState),
}));
