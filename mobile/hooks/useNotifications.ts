import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import api from '@/utils/api';
import { useAuthStore } from './useAuth';

/**
 * Lazily-loaded Expo modules.
 * expo-notifications and expo-device require native modules that
 * may not be available in Expo Go — we import them dynamically
 * so the rest of the app keeps working even without a dev build.
 */
let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;
let Constants: typeof import('expo-constants')['default'] | null = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
  Constants = require('expo-constants').default;

  // Configure foreground notification behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('[Notifications] Native module not available — skipping setup.', e);
}

/* ──────────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────────── */

export function useNotifications() {
  const { user } = useAuthStore();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (!user || !Notifications) return;

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        syncTokenWithBackend(token);
      }
    });

    // Listen for notifications while the app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('[Notifications] Received in foreground:', notification);
      });

    // Listen for user interactions with notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data as any;
        console.log('[Notifications] User interacted with:', data?.type);
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);
}

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

async function syncTokenWithBackend(token: string) {
  try {
    await api.post('/notifications/register', { token });
    console.log('[Notifications] Token synced with backend');
  } catch (err) {
    console.error('[Notifications] Failed to sync token:', err);
  }
}

async function registerForPushNotificationsAsync() {
  if (!Notifications || !Device || !Constants) return undefined;

  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted.');
      return undefined;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;

    if (!projectId) {
      console.warn('[Notifications] Project ID not found.');
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('[Notifications] Expo Push Token:', token);
    } catch (e) {
      console.error('[Notifications] Error getting token:', e);
    }
  } else {
    console.log('[Notifications] Must use physical device for push notifications.');
  }

  return token;
}
