import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/**
 * DTO for the voice journal endpoint.
 * Accepts a base64-encoded audio recording.
 */
const voiceJournalSchema = z.object({
  audio: z
    .string()
    .min(1, 'Audio data is required')
    .max(15_000_000, 'Audio file is too large (max ~10 MB base64)'),
});

export class VoiceJournalDto extends createZodDto(voiceJournalSchema) {}
