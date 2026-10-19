import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const baseURL = process.env.EXPO_PUBLIC_NEON_AUTH_URL || 'https://ep-weathered-flower-b4mcbnhk.neonauth.c-6.us-east-2.aws.neon.tech/neondb/auth';

/**
 * Cross-platform storage adapter for Better Auth on Expo.
 * Uses SecureStore on iOS/Android and localStorage on web.
 */
const storage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return SecureStore.getItem(key);
  },
  getItemAsync: async (key: string) => {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    SecureStore.setItem(key, value);
  },
  setItemAsync: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
};

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: 'moody',
      storage,
    }),
  ],
});

export type AuthSession = typeof authClient.$Infer.Session;
export type AuthUser = typeof authClient.$Infer.Session.user;
