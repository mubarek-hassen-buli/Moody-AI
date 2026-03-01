import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const sendMessageSchema = z.object({
  message: z
    .string({ message: 'Message is required' })
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters'),
});

export class SendMessageDto extends createZodDto(sendMessageSchema) {}
