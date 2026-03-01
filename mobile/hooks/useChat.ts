import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export type ChatRole = "user" | "ai";

export interface ChatMessage {
  id: string;
  content: string;
  role: ChatRole;
  createdAt: string;
}

interface SendMessageResponse {
  userMessage: ChatMessage;
  aiReply: ChatMessage;
}

/* ──────────────────────────────────────────────────────────
 * Query keys
 * ────────────────────────────────────────────────────────── */

export const CHAT_KEYS = {
  history: ["chat", "history"] as const,
};

/* ──────────────────────────────────────────────────────────
 * Hooks
 * ────────────────────────────────────────────────────────── */

/**
 * Fetch the full conversation history for the current user.
 * Messages are ordered oldest → newest.
 */
export function useChatHistory() {
  return useQuery<ChatMessage[]>({
    queryKey: CHAT_KEYS.history,
    queryFn: async () => {
      const { data } = await api.get("/chat/history");
      return data.data;
    },
    staleTime: 0, // Always refetch on mount — history must be fresh
  });
}

/**
 * Send a message to the AI companion.
 *
 * On success, the new user message + AI reply are appended to the
 * TanStack cache so the UI updates immediately.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, Error, string>({
    mutationFn: async (message: string) => {
      const { data } = await api.post("/chat/send", { message });
      return data.data;
    },
    onSuccess: (result) => {
      // Append both messages to the cached history without a full refetch
      queryClient.setQueryData<ChatMessage[]>(CHAT_KEYS.history, (prev) => {
        const base = prev ?? [];
        return [...base, result.userMessage, result.aiReply];
      });
    },
  });
}
