import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const updateProfileSchema = z.object({
  name: z
    .string({ message: 'Name must be a string' })
    .trim()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),

  avatarBase64: z
    .string({ message: 'Avatar must be a base64 string' })
    .min(1, 'Avatar data cannot be empty')
    .optional(),
});

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {}
