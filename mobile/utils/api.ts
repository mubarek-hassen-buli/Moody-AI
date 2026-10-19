import axios from 'axios';
import { authClient } from '@/utils/auth-client';

/**
 * Pre-configured Axios instance for the Moody-AI NestJS backend.
 *
 * Automatically attaches the Neon Auth (Better Auth) session token to every request.
 */
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.50:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Neon Auth session token and cookie
api.interceptors.request.use(async (config) => {
  try {
    const { data } = await authClient.getSession();
    const token = data?.session?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Also forward stored cookie if available on expo client
    if (typeof (authClient as any).getCookie === 'function') {
      const cookie = await (authClient as any).getCookie();
      if (cookie) {
        config.headers.Cookie = cookie;
      }
    }
  } catch (err) {
    // Session fetching failed or offline
  }

  return config;
});

export default api;
