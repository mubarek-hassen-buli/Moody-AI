import { useRef, useState, useCallback, useEffect } from 'react';
import Vapi from '@vapi-ai/react-native';

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

const VAPI_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPI_PUBLIC_KEY!;
const ASSISTANT_ID = process.env.EXPO_PUBLIC_VAPI_ASSISTANT_ID!;

/* ──────────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────────── */

export function useVoiceCall() {
  const vapiRef = useRef<Vapi | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMutedState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lazily create the Vapi instance and wire up event listeners once.
  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on('call-start', () => {
      console.log('[Voice] ✅ Call started');
      setIsCalling(true);
      setIsConnecting(false);
      setError(null);
    });

    vapi.on('call-end', () => {
      console.log('[Voice] Call ended');
      setIsCalling(false);
      setIsConnecting(false);
      setIsMutedState(false);
    });

    vapi.on('error', (err: any) => {
      console.error('[Voice] ❌ Error:', err);
      setError(typeof err === 'string' ? err : err?.message ?? 'Unknown error');
      setIsConnecting(false);
    });

    vapi.on('speech-start', () => {
      console.log('[Voice] 🗣️ User speech detected');
    });

    vapi.on('speech-end', () => {
      console.log('[Voice] 🔇 User speech ended');
    });

    return () => {
      vapi.stop();
    };
  }, []);

  // ── Start a call ──────────────────────────────────────────

  const startCall = useCallback(async () => {
    if (!vapiRef.current) return;
    try {
      setError(null);
      setIsConnecting(true);
      console.log('[Voice] Starting call with assistant:', ASSISTANT_ID);
      await vapiRef.current.start(ASSISTANT_ID);
    } catch (err: any) {
      console.error('[Voice] ❌ Failed to start call:', err);
      setError(err?.message ?? 'Failed to start call');
      setIsConnecting(false);
    }
  }, []);

  // ── Stop a call ───────────────────────────────────────────

  const stopCall = useCallback(() => {
    vapiRef.current?.stop();
  }, []);

  // ── Mute / Unmute ─────────────────────────────────────────

  const setIsMuted = useCallback((muted: boolean) => {
    vapiRef.current?.setMuted(muted);
    setIsMutedState(muted);
  }, []);

  return {
    isCalling,
    isConnecting,
    isMuted,
    setIsMuted,
    error,
    startCall,
    stopCall,
  };
}
