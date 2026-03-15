import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { Audio } from 'expo-av';
import { File } from 'expo-file-system';
import { useAudioRecorder } from '@siteed/expo-audio-studio';
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
 * Helpers
 * ────────────────────────────────────────────────────────── */

/**
 * Request microphone permission from the OS.
 * Returns true if granted, false otherwise.
 */
async function ensureMicPermission(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();

  if (status === 'granted') return true;

  // Permission denied — guide user to settings
  Alert.alert(
    'Microphone Permission Required',
    'Moody needs microphone access to record voice journal entries. Please enable it in your device settings.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => Linking.openSettings(),
      },
    ],
  );

  return false;
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
 * - `start()`     — requests mic permission, then begins recording
 * - `stop()`      — stops and returns base64 audio data
 */
export function useVoiceRecorder() {
  const recorder = useAudioRecorder();
  const [error, setError] = useState<string | null>(null);

  /* ── Start recording ────────────────────────────────── */
  const start = useCallback(async () => {
    try {
      setError(null);

      // Request microphone permission before recording
      const granted = await ensureMicPermission();
      if (!granted) return;

      await recorder.startRecording(RECORDING_CONFIG);
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

      // Read the WAV file as base64 using the new Expo SDK 54 File API
      const audioFile = new File(recording.fileUri);
      const audioBase64 = await audioFile.base64();

      if (!audioBase64) {
        setError('Failed to process audio');
        return null;
      }

      return {
        audioBase64,
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
