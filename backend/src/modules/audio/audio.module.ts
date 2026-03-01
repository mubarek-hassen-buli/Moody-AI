import { Module } from '@nestjs/common';
import { AudioService } from './audio.service.js';
import { AudioController } from './audio.controller.js';

@Module({
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
