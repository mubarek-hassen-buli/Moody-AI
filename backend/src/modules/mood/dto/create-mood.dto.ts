import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

/* ──────────────────────────────────────────────────────────
 * Zod schema — validated at the controller layer
 * ────────────────────────────────────────────────────────── */

const createMoodSchema = z.object({
  mood: z.enum(['awful', 'bad', 'okay', 'good', 'great']),
  note: z.string().max(500, 'Note must be 500 characters or fewer').optional(),
});

export class CreateMoodDto extends createZodDto(createMoodSchema) {}
