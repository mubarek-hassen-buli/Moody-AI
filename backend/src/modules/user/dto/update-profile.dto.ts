import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateProfileSchema = z.object({
  name: z
    .string({ message: 'Name must be a string' })
    .trim()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
});

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}
