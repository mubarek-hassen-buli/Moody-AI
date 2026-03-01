import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

/* ──────────────────────────────────────────────────────────
 * Query keys
 * ────────────────────────────────────────────────────────── */

export const PROFILE_KEYS = {
  me: ["user", "me"] as const,
};

/* ──────────────────────────────────────────────────────────
 * Hooks
 * ────────────────────────────────────────────────────────── */

/** Fetch the current user's Neon profile (name, email, avatar). */
export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: PROFILE_KEYS.me,
    queryFn: async () => {
      const { data } = await api.get("/user/me");
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/** Update the user's display name. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await api.patch("/user/me", payload);
      return data.data as UserProfile;
    },
    onSuccess: (updated) => {
      // Update cache immediately — no re-fetch needed
      queryClient.setQueryData<UserProfile>(PROFILE_KEYS.me, updated);
    },
  });
}
