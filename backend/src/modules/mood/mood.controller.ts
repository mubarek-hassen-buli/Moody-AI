import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { NeonAuthGuard } from '../../core/auth/neon-auth.guard.js';
import type { AuthenticatedUser } from '../../core/auth/neon-auth.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { MoodService } from './mood.service.js';
import { CreateMoodDto } from './dto/create-mood.dto.js';

@Controller('mood')
@UseGuards(NeonAuthGuard)
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  /**
   * POST /api/mood
   * Log or update a mood entry for the authenticated user for today (atomic upsert).
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMoodDto,
  ) {
    const entry = await this.moodService.create(user.id, dto);
    return { data: entry };
  }

  /**
   * GET /api/mood/today
   * Returns today's mood entry, or null if not yet logged.
   */
  @Get('today')
  async getToday(@CurrentUser() user: AuthenticatedUser) {
    const entry = await this.moodService.getTodayMood(user.id);
    return { data: entry };
  }

  /**
   * GET /api/mood/weekly
   * Returns the last 7 days of mood scores (1-5).
   */
  @Get('weekly')
  async getWeekly(@CurrentUser() user: AuthenticatedUser) {
    const days = await this.moodService.getWeekly(user.id);
    return { data: days };
  }

  /**
   * GET /api/mood/stats
   * Returns percentage breakdown per emotion for the last 30 days via DB aggregation.
   */
  @Get('stats')
  async getStats(@CurrentUser() user: AuthenticatedUser) {
    const stats = await this.moodService.getStats(user.id);
    return { data: stats };
  }
}
