import axios from 'axios';
import { supabase } from '@/utils/supabase';

/**
 * Pre-configured Axios instance for the Moody-AI NestJS backend.
 *
 * Automatically attaches the Supabase JWT to every request.
 * Gets the token directly from the Supabase client to avoid
 * circular dependency with useAuth.
 *
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
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default api;
