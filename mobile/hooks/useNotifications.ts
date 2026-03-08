import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from '@/utils/api';
import { useAuthStore } from './useAuth';

// Configure notification behavior for when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const { user } = useAuthStore();
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (!user) return;

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        syncTokenWithBackend(token);
      }
    });

    // Listen for notifications while the app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Notifications] Received in foreground:', notification);
    });

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as any;
      console.log('[Notifications] User interacted with:', data?.type);
      // We can add navigation logic here if needed
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

async function syncTokenWithBackend(token: string) {
  try {
    await api.post('/notifications/register', { token });
    console.log('[Notifications] Token synced with backend');
  } catch (err) {
    console.error('[Notifications] Failed to sync token:', err);
  }
}

async function registerForPushNotificationsAsync() {
  let token;

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
      console.warn('[Notifications] Failed to get push token for push notification!');
      return;
    }

    // projectID is required for Expo Go and EAS builds
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.warn('[Notifications] Project ID not found. Ensure you are logged into Expo.');
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
      console.log('[Notifications] Expo Push Token:', token);
    } catch (e) {
      console.error('[Notifications] Error getting token:', e);
    }
  } else {
    console.log('[Notifications] Must use physical device for Push Notifications');
  }

  return token;
}
