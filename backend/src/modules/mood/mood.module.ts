import { Module } from '@nestjs/common';
import { MoodService } from './mood.service.js';
import { MoodController } from './mood.controller.js';

@Module({
  controllers: [MoodController],
  providers: [MoodService],
})
export class MoodModule {}
