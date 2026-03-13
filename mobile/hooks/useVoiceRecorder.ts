import { useCallback, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useAudioRecorder, extractAudioData } from '@siteed/expo-audio-studio';
import type { AudioRecording, RecordingConfig } from '@siteed/expo-audio-studio';

/* ──────────────────────────────────────────────────────────
 * Recording configuration
 *
 * 16kHz mono WAV is optimal for speech recognition:
 * - Small file size (~256 KB for 10s)
 * - High enough quality for transcription
 * - Universally supported by AI models
 * ────────────────────────────────────────────────────────── */

const RECORDING_CONFIG: RecordingConfig = {
  sampleRate: 16000,
  channels: 1,
  encoding: 'pcm_16bit',
  keepAwake: true,
};

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export interface VoiceRecorderResult {
  /** Base64-encoded audio data (WAV) */
  audioBase64: string;
  /** Duration of the recording in milliseconds */
  durationMs: number;
  /** MIME type of the audio */
  mimeType: string;
}

/* ──────────────────────────────────────────────────────────
 * Hook
 * ────────────────────────────────────────────────────────── */

/**
 * useVoiceRecorder
 *
 * Manages audio recording for voice journaling.
 * Uses `@siteed/expo-audio-studio` under the hood.
 *
 * Returns:
 * - `isRecording` — true while recording is active
 * - `durationMs`  — elapsed recording time
 * - `start()`     — begins recording audio
 * - `stop()`      — stops and returns base64 audio data
 */
export function useVoiceRecorder() {
  const recorder = useAudioRecorder();
  const [error, setError] = useState<string | null>(null);

  /** File URI is stored by ref so we can retrieve it on stop. */
  const fileUriRef = useRef<string | null>(null);

  /* ── Start recording ────────────────────────────────── */
  const start = useCallback(async () => {
    try {
      setError(null);
      const result = await recorder.startRecording(RECORDING_CONFIG);
      fileUriRef.current = result.fileUri;
    } catch (err: any) {
      const message = err?.message ?? 'Failed to start recording';
      setError(message);
      Alert.alert('Recording Error', message);
    }
  }, [recorder]);

  /* ── Stop recording and extract base64 ──────────────── */
  const stop = useCallback(async (): Promise<VoiceRecorderResult | null> => {
    try {
      const recording: AudioRecording | null = await recorder.stopRecording();

      if (!recording?.fileUri) {
        setError('No audio recorded');
        return null;
      }

      /* Extract the raw audio data as base64 from the file */
      const extracted = await extractAudioData({
        fileUri: recording.fileUri,
        includeBase64Data: true,
        includeWavHeader: true,
      });

      if (!extracted.base64Data) {
        setError('Failed to process audio');
        return null;
      }

      return {
        audioBase64: extracted.base64Data,
        durationMs: recording.durationMs,
        mimeType: recording.mimeType ?? 'audio/wav',
      };
    } catch (err: any) {
      const message = err?.message ?? 'Failed to stop recording';
      setError(message);
      Alert.alert('Recording Error', message);
      return null;
    }
  }, [recorder]);

  return {
    isRecording: recorder.isRecording,
    durationMs: recorder.durationMs,
    error,
    start,
    stop,
  };
}
