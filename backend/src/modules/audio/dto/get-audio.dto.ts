import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const getAudioByCategory = z.object({
  category: z.enum(['relaxing', 'workout'], {
    message: 'Category must be either "relaxing" or "workout"',
  }),
});

export class GetAudioByCategoryDto extends createZodDto(getAudioByCategory) {}
