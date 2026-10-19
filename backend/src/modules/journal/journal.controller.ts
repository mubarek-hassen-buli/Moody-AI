import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NeonAuthGuard } from '../../core/auth/neon-auth.guard.js';
import type { AuthenticatedUser } from '../../core/auth/neon-auth.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { JournalService } from './journal.service.js';
import { VoiceJournalService } from './voice-journal.service.js';
import { CreateJournalDto } from './dto/create-journal.dto.js';
import { UpdateJournalDto } from './dto/update-journal.dto.js';
import { VoiceJournalDto } from './dto/voice-journal.dto.js';

@Controller('journal')
@UseGuards(NeonAuthGuard)
export class JournalController {
  constructor(
    private readonly journalService: JournalService,
    private readonly voiceJournalService: VoiceJournalService,
  ) {}

  /**
   * POST /api/journal
   * Create a new journal entry.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateJournalDto,
  ) {
    const entry = await this.journalService.create(user.id, dto);
    return { data: entry };
  }

  /**
   * POST /api/journal/voice
   * Create a journal entry from a voice recording.
   * Transcribes audio, detects mood, and saves to Neon.
   */
  @Post('voice')
  @HttpCode(HttpStatus.CREATED)
  async createFromVoice(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VoiceJournalDto,
  ) {
    const result = await this.voiceJournalService.processVoiceEntry(
      user.id,
      dto.audio,
    );
    return { data: result };
  }

  /**
   * GET /api/journal
   * List journal entries for the current user (newest first).
   */
  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const entries = await this.journalService.findAll(user.id);
    return { data: entries };
  }

  /**
   * GET /api/journal/:id
   * Get a single journal entry by ID.
   */
  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const entry = await this.journalService.findOne(user.id, id);
    return { data: entry };
  }

  /**
   * PATCH /api/journal/:id
   * Update a journal entry (partial update).
   */
  @Patch(':id')
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJournalDto,
  ) {
    const entry = await this.journalService.update(user.id, id, dto);
    return { data: entry };
  }

  /**
   * DELETE /api/journal/:id
   * Delete a journal entry.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.journalService.remove(user.id, id);
  }
}
