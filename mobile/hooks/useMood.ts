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
  weekly: ['mood', 'weekly'] as const,
  stats: ['mood', 'stats'] as const,
};

/* ──────────────────────────────────────────────────────────
 * Hooks
 * ────────────────────────────────────────────────────────── */

/**
 * Logs a mood for the current day.
 * On success, invalidates weekly + stats queries so charts refresh.
 */
export function useCreateMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { mood: MoodLevel; note?: string }) => {
      const { data } = await api.post('/mood', payload);
      return data;
    },
    onSuccess: () => {
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
