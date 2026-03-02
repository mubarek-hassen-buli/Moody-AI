import { Module } from '@nestjs/common';
import { VoiceGateway } from './voice.gateway.js';
import { VoiceService } from './voice.service.js';

@Module({
  providers: [VoiceGateway, VoiceService],
})
export class VoiceModule {}
