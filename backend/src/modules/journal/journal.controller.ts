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
  UseGuards,
} from '@nestjs/common';
import { SupabaseGuard } from '../../core/auth/supabase.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { JournalService } from './journal.service.js';
import { CreateJournalDto } from './dto/create-journal.dto.js';
import { UpdateJournalDto } from './dto/update-journal.dto.js';

@Controller('journal')
@UseGuards(SupabaseGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  /**
   * POST /api/journal
   * Create a new journal entry.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() supabaseUser: any,
    @Body() dto: CreateJournalDto,
  ) {
    const entry = await this.journalService.create(supabaseUser.id, dto);
    return { data: entry };
  }

  /**
   * GET /api/journal
   * List all journal entries (newest first).
   */
  @Get()
  async findAll(@CurrentUser() supabaseUser: any) {
    const entries = await this.journalService.findAll(supabaseUser.id);
    return { data: entries };
  }

  /**
   * GET /api/journal/:id
   * Get a single journal entry by ID.
   */
  @Get(':id')
  async findOne(
    @CurrentUser() supabaseUser: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const entry = await this.journalService.findOne(supabaseUser.id, id);
    return { data: entry };
  }

  /**
   * PATCH /api/journal/:id
   * Update a journal entry (partial update).
   */
  @Patch(':id')
  async update(
    @CurrentUser() supabaseUser: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJournalDto,
  ) {
    const entry = await this.journalService.update(supabaseUser.id, id, dto);
    return { data: entry };
  }

  /**
   * DELETE /api/journal/:id
   * Delete a journal entry.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() supabaseUser: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.journalService.remove(supabaseUser.id, id);
  }
}
