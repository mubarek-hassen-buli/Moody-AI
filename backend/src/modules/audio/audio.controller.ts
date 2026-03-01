import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SupabaseGuard } from '../../core/auth/supabase.guard.js';
import { AudioService } from './audio.service.js';
import { GetAudioByCategoryDto } from './dto/get-audio.dto.js';

@Controller('audio')
@UseGuards(SupabaseGuard)
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  /**
   * GET /api/audio
   * Returns all audio tracks.
   */
  @Get()
  async findAll() {
    const tracks = await this.audioService.findAll();
    return { data: tracks };
  }

  /**
   * GET /api/audio/:category
   * Returns audio tracks for a specific category (relaxing | workout).
   */
  @Get(':category')
  async findByCategory(@Param() params: GetAudioByCategoryDto) {
    const tracks = await this.audioService.findByCategory(params.category);
    return { data: tracks };
  }
}
