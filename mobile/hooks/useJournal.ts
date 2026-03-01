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

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJournalPayload {
  title: string;
  content: string;
}

export interface UpdateJournalPayload {
  id: string;
  title?: string;
  content?: string;
}

/* ──────────────────────────────────────────────────────────
 * Query keys
 * ────────────────────────────────────────────────────────── */

export const JOURNAL_KEYS = {
  all: ['journal'] as const,
  one: (id: string) => ['journal', id] as const,
};

/* ──────────────────────────────────────────────────────────
 * Hooks
 * ────────────────────────────────────────────────────────── */

/**
 * Fetch all journal entries for the current user (newest first).
 * Writes to the Zustand store for instant subsequent renders.
 */
export function useJournalEntries() {
  const setJournalEntries = useDataStore((s) => s.setJournalEntries);

  return useQuery<JournalEntry[]>({
    queryKey: JOURNAL_KEYS.all,
    queryFn: async () => {
      const { data } = await api.get('/journal');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (entries) => {
      setJournalEntries(entries);
      return entries;
    },
  });
}

/** Create a new journal entry. Invalidates the list on success. */
export function useCreateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateJournalPayload) => {
      const { data } = await api.post('/journal', payload);
      return data.data as JournalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.all });
    },
  });
}

/** Update an existing journal entry. Invalidates list + the specific entry. */
export function useUpdateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: UpdateJournalPayload) => {
      const { data } = await api.patch(`/journal/${id}`, rest);
      return data.data as JournalEntry;
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.one(entry.id) });
    },
  });
}

/** Delete a journal entry. Invalidates the list on success. */
export function useDeleteJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/journal/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.all });
    },
  });
}
