import axios from 'axios';
import { useAuthStore } from '@/hooks/useAuth';

/**
 * Pre-configured Axios instance for the Moody-AI NestJS backend.
 *
 * Automatically attaches the Supabase JWT to every request.
 * Update `baseURL` to your deployed backend URL when ready.
 */
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Supabase access token
api.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session;
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default api;
