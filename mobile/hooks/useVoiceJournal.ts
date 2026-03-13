import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

/** Payload sent to the backend voice endpoint. */
interface VoiceJournalPayload {
  /** Base64-encoded audio data */
  audio: string;
}

/** Detected mood returned by the AI. */
export type DetectedMood = 'awful' | 'bad' | 'okay' | 'good' | 'great';

/** Shape of the journal entry returned by the backend. */
export interface VoiceJournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** Full response from POST /api/journal/voice. */
export interface VoiceJournalResult {
  entry: VoiceJournalEntry;
  mood: DetectedMood;
}

/* ──────────────────────────────────────────────────────────
 * API call
 * ────────────────────────────────────────────────────────── */

async function submitVoiceJournal(
  payload: VoiceJournalPayload,
): Promise<VoiceJournalResult> {
  // Audio uploads need a longer timeout than the default 15s
  const { data } = await api.post('/journal/voice', payload, {
    timeout: 60_000,
  });
  return data.data;
}

/* ──────────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────────── */

/**
 * useVoiceJournal
 *
 * TanStack Query mutation that sends recorded audio to the
 * backend for transcription, title generation, and mood detection.
 *
 * On success, invalidates the journal list query so the new
 * entry appears immediately.
 *
 * Usage:
 * ```ts
 * const { mutateAsync, isPending } = useVoiceJournal();
 * const result = await mutateAsync({ audio: base64String });
 * console.log(result.entry.title, result.mood);
 * ```
 */
export function useVoiceJournal() {
  const queryClient = useQueryClient();

  return useMutation<VoiceJournalResult, Error, VoiceJournalPayload>({
    mutationFn: submitVoiceJournal,
    onSuccess: () => {
      // Refresh the journal list so the new entry appears
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });
}
