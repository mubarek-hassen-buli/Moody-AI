import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';

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
 */
export function useWeeklyMoods() {
  return useQuery<WeeklyDay[]>({
    queryKey: MOOD_KEYS.weekly,
    queryFn: async () => {
      const { data } = await api.get('/mood/weekly');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetches emotion percentage breakdown for the donut chart (last 30 days).
 */
export function useMoodStats() {
  return useQuery<MoodStats>({
    queryKey: MOOD_KEYS.stats,
    queryFn: async () => {
      const { data } = await api.get('/mood/stats');
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
