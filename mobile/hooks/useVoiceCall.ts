import { useRef, useState, useCallback, useEffect } from 'react';
import { useAudioRecorder, AudioAnalysis, AudioDataEvent } from '@siteed/expo-audio-studio';
import { Audio } from 'expo-av';
import { useAuthStore } from './useAuth';

/* ──────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────── */

const API_ROOT = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const WS_URL = API_ROOT.replace('http', 'ws').replace('/api', '/ws/voice');

/* ──────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────── */

/**
 * Prepends a minimal 44-byte WAV header to PCM data.
 * Gemini sends 24kHz, 16-bit, mono PCM by default.
 */
function pcmToWavBase64(pcmBase64: string, sampleRate = 24000): string {
  const pcmBuffer = Buffer.from(pcmBase64, 'base64');
  const numChannels = 1;
  const bitDepth = 16;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeInt32LE(36 + pcmBuffer.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeInt32LE(16, 16);
  header.writeInt16LE(1, 20); // PCM
  header.writeInt16LE(numChannels, 22);
  header.writeInt32LE(sampleRate, 24);
  header.writeInt32LE(sampleRate * numChannels * (bitDepth / 8), 28);
  header.writeInt16LE(numChannels * (bitDepth / 8), 32);
  header.writeInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]).toString('base64');
}

/* ──────────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────────── */

export function useVoiceCall() {
  const session = useAuthStore((s) => s.session);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorder = useAudioRecorder();
  const soundQueue = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  // ── Playback Logic ───────────────────────────────────────

  const playNextInQueue = useCallback(async () => {
    if (soundQueue.current.length === 0 || isPlayingRef.current) return;

    isPlayingRef.current = true;
    const base64Wav = soundQueue.current.shift();
    if (!base64Wav) {
      isPlayingRef.current = false;
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${base64Wav}` },
        { shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          isPlayingRef.current = false;
          playNextInQueue();
        }
      });
    } catch (e) {
      console.error('[Voice] Playback error', e);
      isPlayingRef.current = false;
      playNextInQueue();
    }
  }, []);

  // ── WebSocket Management ─────────────────────────────────

  const stopCall = useCallback(async () => {
    wsRef.current?.close();
    wsRef.current = null;
    setIsCalling(false);
    soundQueue.current = [];
    if (audioRecorder.isRecording) {
      await audioRecorder.stopRecording();
    }
  }, [audioRecorder]);

  const connect = useCallback(async () => {
    if (!session?.access_token) return;

    try {
      const urlWithToken = `${WS_URL}?token=${session.access_token}`;
      const ws = new WebSocket(urlWithToken);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Voice] WebSocket connected');
        setIsCalling(true);
        setError(null);
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.serverContent?.modelTurn?.parts) {
            const parts = data.serverContent.modelTurn.parts;
            for (const part of parts) {
              if (part.inlineData?.mimeType?.includes('audio') && part.inlineData.data) {
                // Convert PCM to WAV and queue for playback
                const wavBase64 = pcmToWavBase64(part.inlineData.data);
                soundQueue.current.push(wavBase64);
                playNextInQueue();
              }
            }
          }

          if (data.type === 'error') {
            setError(data.message);
          }
        } catch (e) {
          // JSON parsing failed or other logic error
        }
      };

      ws.onerror = (e) => {
        console.error('[Voice] WebSocket error', e);
        setError('Connection error');
      };

      ws.onclose = () => {
        console.log('[Voice] WebSocket closed');
        setIsCalling(false);
        stopCall();
      };
    } catch (err) {
      setError('Could not establish connection');
    }
  }, [session, stopCall, playNextInQueue]);

  // ── Recording Management ─────────────────────────────────

  useEffect(() => {
    if (isCalling) {
      // Set audio mode for playback while recording
      Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      audioRecorder.startRecording({
        sampleRate: 16000,
        channels: 1,
        encoding: 'pcm_16bit',
        interval: 100, // Emit 100ms chunks
        onAudioStream: async (event: AudioDataEvent) => {
          if (wsRef.current?.readyState === WebSocket.OPEN && !isMuted) {
            const base64Data = typeof event.data === 'string' ? event.data : '';
            if (!base64Data) return;

            const message = {
              realtime_input: {
                media_chunks: [{
                  mime_type: 'audio/pcm;rate=16000',
                  data: base64Data
                }]
              }
            };
            wsRef.current.send(JSON.stringify(message));
          }
        }
      });
    } else if (audioRecorder.isRecording) {
      audioRecorder.stopRecording();
    }
  }, [isCalling, isMuted, audioRecorder]);

  return {
    isCalling,
    isMuted,
    setIsMuted,
    error,
    startCall: connect,
    stopCall,
  };
}
