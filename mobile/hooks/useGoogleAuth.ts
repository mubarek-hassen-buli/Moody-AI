import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { authClient } from '@/utils/auth-client';
import { useAuthStore, type AppSession, type AppUser } from '@/hooks/useAuth';
import api from '@/utils/api';

WebBrowser.maybeCompleteAuthSession();

/**
 * useGoogleAuth
 *
 * Handles Google OAuth sign-in via Neon Auth (Better Auth) and Expo WebBrowser.
 */
export function useGoogleAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);

    try {
      const res = await authClient.signIn.social({
        provider: 'google',
        callbackURL: 'moody://auth/callback',
      });

      if ((res as any)?.error) {
        throw new Error((res as any).error.message || 'Failed to start Google sign-in.');
      }

      // Check session after OAuth browser returns
      const sessionRes = await authClient.getSession();
      if (sessionRes.data?.session && sessionRes.data?.user) {
        useAuthStore.setState({
          session: sessionRes.data.session as unknown as AppSession,
          user: sessionRes.data.user as unknown as AppUser,
        });

        // Sync user to backend in background
        api.get('/user/me').catch(() => {});

        router.replace('/(tabs)' as any);
      }
    } catch (err: any) {
      console.error('[GoogleAuth] ❌', err?.message);
      Alert.alert(
        'Google Sign-In Failed',
        err?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { signInWithGoogle, loading };
}
