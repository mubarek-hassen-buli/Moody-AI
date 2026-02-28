import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateJournalSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer')
    .optional(),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(10000, 'Content must be 10,000 characters or fewer')
    .optional(),
});

export class UpdateJournalDto extends createZodDto(updateJournalSchema) {}
