import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const registerTokenSchema = z.object({
  token: z
    .string({ message: 'Token is required' })
    .trim()
    .min(1, 'Token cannot be empty'),
});

export class RegisterTokenDto extends createZodDto(registerTokenSchema) {}
