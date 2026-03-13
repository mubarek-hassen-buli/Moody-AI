import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import api from '@/utils/api';
import { useAuthStore } from './useAuth';

/* ──────────────────────────────────────────────────────────
 * Lazily-loaded Expo modules.
 *
 * expo-notifications and expo-device require native modules
 * that may not be available in Expo Go — we import them
 * dynamically so the app keeps working without a dev build.
 * ────────────────────────────────────────────────────────── */

let Notifications: typeof import('expo-notifications') | null = null;
let Device: typeof import('expo-device') | null = null;
let Constants: typeof import('expo-constants')['default'] | null = null;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
  Constants = require('expo-constants').default;

  // Configure foreground notification behavior
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (e) {
  console.warn('[Notifications] Native module not available — skipping setup.', e);
}

/* ──────────────────────────────────────────────────────────
 * useNotificationPermission
 *
 * Returns the current permission state and a function to
 * request / toggle notifications from the profile screen.
 * ────────────────────────────────────────────────────────── */

export function useNotificationPermission() {
  const [enabled, setEnabled] = useState(false);
  const [checking, setChecking] = useState(true);

  /** Read the current permission status from the OS. */
  const checkPermission = useCallback(async () => {
    if (!Notifications) {
      setEnabled(false);
      setChecking(false);
      return;
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      setEnabled(status === 'granted');
    } catch {
      setEnabled(false);
    } finally {
      setChecking(false);
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  /**
   * Toggle handler for the profile switch.
   *
   * - Toggling ON  → requests permission (or opens settings if denied)
   * - Toggling OFF → opens system settings (apps can't revoke permission programmatically)
   */
  const toggle = useCallback(async (newValue: boolean) => {
    if (!Notifications || !Device) {
      Alert.alert(
        'Not Available',
        'Push notifications require a physical device with a production build.',
      );
      return;
    }

    if (!Device.isDevice) {
      Alert.alert(
        'Physical Device Required',
        'Push notifications only work on a real device, not in a simulator.',
      );
      return;
    }

    if (newValue) {
      // ── User wants to ENABLE notifications ─────────────
      const { status: existing } = await Notifications.getPermissionsAsync();

      if (existing === 'granted') {
        setEnabled(true);
        return;
      }

      // First time: prompt the system permission dialog
      const { status: requested } = await Notifications.requestPermissionsAsync();

      if (requested === 'granted') {
        setEnabled(true);

        // Register the token now that we have permission
        const token = await getExpoPushToken();
        if (token) {
          await syncTokenWithBackend(token);
        }
      } else {
        // Permission denied — guide user to system settings
        setEnabled(false);
        Alert.alert(
          'Permission Required',
          'Notifications are disabled in your device settings. Would you like to open settings to enable them?',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }
    } else {
      // ── User wants to DISABLE notifications ────────────
      // Apps cannot revoke permissions programmatically on iOS/Android.
      // Guide the user to system settings.
      Alert.alert(
        'Disable Notifications',
        'To turn off notifications, please disable them in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
    }
  }, []);

  return { enabled, checking, toggle };
}

/* ──────────────────────────────────────────────────────────
 * useNotifications
 *
 * Automatically registers for push notifications and
 * listens for foreground events. Call once in app root.
 * ────────────────────────────────────────────────────────── */

export function useNotifications() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || !Notifications) return;

    // Attempt to register and sync token with backend
    registerForPushNotificationsAsync().then((token) => {
      if (token) syncTokenWithBackend(token);
    });

    // Listen for notifications in foreground
    const notificationSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Notifications] Received:', notification.request.content.title);
      },
    );

    // Listen for user interactions with notifications
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as any;
        console.log('[Notifications] Interaction:', data?.type);
      },
    );

    return () => {
      notificationSub.remove();
      responseSub.remove();
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

async function getExpoPushToken(): Promise<string | undefined> {
  if (!Notifications || !Constants) return undefined;

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    (Constants as any)?.easConfig?.projectId;

  if (!projectId) {
    console.warn('[Notifications] Project ID not found.');
    return undefined;
  }

  try {
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (e) {
    console.error('[Notifications] Error getting token:', e);
    return undefined;
  }
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Notifications || !Device || !Constants) return undefined;

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    console.log('[Notifications] Must use physical device for push notifications.');
    return undefined;
  }

  // Check / request permission
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

  return getExpoPushToken();
}
