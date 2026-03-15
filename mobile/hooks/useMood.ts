import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import api from '@/utils/api';
import { useDataStore } from '@/stores/useDataStore';

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export type MoodLevel = 'awful' | 'bad' | 'okay' | 'good' | 'great';

export interface WeeklyDay {
  day: string;
  score: number | null;
}

export interface EmotionSegment {
  mood: string;
  label: string;
  percentage: number;
  color: string;
}

export interface MoodStats {
  total: number;
  breakdown: EmotionSegment[];
}

/* ──────────────────────────────────────────────────────────
 * Query keys — centralised to avoid typos
 * ────────────────────────────────────────────────────────── */

export const MOOD_KEYS = {
  today: ['mood', 'today'] as const,
  weekly: ['mood', 'weekly'] as const,
  stats: ['mood', 'stats'] as const,
};

/* ──────────────────────────────────────────────────────────
 * Hooks
 * ────────────────────────────────────────────────────────── */

/** Shape of a mood entry returned from the server. */
export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodLevel;
  note: string | null;
  createdAt: string;
}

/**
 * Fetches today's mood entry from the server.
 *
 * This is the **source of truth** for whether the user has
 * already logged a mood today. Survives sign-out/sign-in,
 * app reinstalls, and cache clears.
 */
export function useTodayMood() {
  return useQuery<MoodEntry | null>({
    queryKey: MOOD_KEYS.today,
    queryFn: async () => {
      const { data } = await api.get('/mood/today');
      return data.data ?? null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Logs a mood for the current day.
 * On success, invalidates today + weekly + stats queries.
 */
export function useCreateMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { mood: MoodLevel; note?: string }) => {
      const { data } = await api.post('/mood', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MOOD_KEYS.today });
      queryClient.invalidateQueries({ queryKey: MOOD_KEYS.weekly });
      queryClient.invalidateQueries({ queryKey: MOOD_KEYS.stats });
    },
  });
}

/**
 * Fetches the last 7 days of mood scores for the line chart.
 * Writes result to the Zustand store for instant subsequent renders.
 */
export function useWeeklyMoods() {
  const setWeeklyMoods = useDataStore((s) => s.setWeeklyMoods);

  return useQuery<WeeklyDay[]>({
    queryKey: MOOD_KEYS.weekly,
    queryFn: async () => {
      const { data } = await api.get('/mood/weekly');
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (moods) => {
      setWeeklyMoods(moods);
      return moods;
    },
  });
}

/**
 * Fetches emotion percentage breakdown for the donut chart (last 30 days).
 * Writes result to the Zustand store for instant subsequent renders.
 */
export function useMoodStats() {
  const setMoodStats = useDataStore((s) => s.setMoodStats);

  return useQuery<MoodStats>({
    queryKey: MOOD_KEYS.stats,
    queryFn: async () => {
      const { data } = await api.get('/mood/stats');
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (stats) => {
      setMoodStats(stats);
      return stats;
    },
  });
}
