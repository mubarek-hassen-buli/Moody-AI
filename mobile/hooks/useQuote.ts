import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import api from "@/utils/api";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export interface Quote {
  id: string;
  quoteText: string;
  author: string | null;
  date: string;
}

/* ──────────────────────────────────────────────────────────
 * Query keys
 * ────────────────────────────────────────────────────────── */

export const QUOTE_KEYS = {
  today: ["quote", "today"] as const,
};

/* ──────────────────────────────────────────────────────────
 * Hooks
 * ────────────────────────────────────────────────────────── */

/** Fetch today's motivational quote. */
export function useQuoteOfDay() {
  return useQuery<Quote>({
    queryKey: QUOTE_KEYS.today,
    queryFn: async () => {
      const { data } = await api.get("/quotes/today");
      return data.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
