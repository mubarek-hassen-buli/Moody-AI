import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SupabaseGuard } from '../../core/auth/supabase.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { MoodService } from './mood.service.js';
import { CreateMoodDto } from './dto/create-mood.dto.js';

@Controller('mood')
@UseGuards(SupabaseGuard)
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  /**
   * POST /api/mood
   * Log a mood entry for the authenticated user.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() supabaseUser: any,
    @Body() dto: CreateMoodDto,
  ) {
    const entry = await this.moodService.create(supabaseUser.id, dto);
    return { data: entry };
  }

  /**
   * GET /api/mood/weekly
   * Returns the last 7 days of mood scores (1-5).
   * Days with no entry have score: null.
   */
  @Get('weekly')
  async getWeekly(@CurrentUser() supabaseUser: any) {
    const days = await this.moodService.getWeekly(supabaseUser.id);
    return { data: days };
  }

  /**
   * GET /api/mood/stats
   * Returns percentage breakdown per emotion for the last 30 days.
   */
  @Get('stats')
  async getStats(@CurrentUser() supabaseUser: any) {
    const stats = await this.moodService.getStats(supabaseUser.id);
    return { data: stats };
  }
}
