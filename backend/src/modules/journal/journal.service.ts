import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../../core/database/database.module.js';
import { journalEntries, users } from '../../core/database/schema.js';
import type * as schema from '../../core/database/schema.js';
import { CreateJournalDto } from './dto/create-journal.dto.js';
import { UpdateJournalDto } from './dto/update-journal.dto.js';

@Injectable()
export class JournalService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  /* ─────────────────────────────────────────────────────────
   * Create a journal entry
   * ───────────────────────────────────────────────────────── */

  async create(supabaseUserId: string, dto: CreateJournalDto) {
    const neonUser = await this.resolveUser(supabaseUserId);

    const [entry] = await this.db
      .insert(journalEntries)
      .values({
        userId: neonUser.id,
        title: dto.title,
        content: dto.content,
      })
      .returning();

    return entry;
  }

  /* ─────────────────────────────────────────────────────────
   * Get all journal entries for the user (newest first)
   * ───────────────────────────────────────────────────────── */

  async findAll(supabaseUserId: string) {
    const neonUser = await this.resolveUser(supabaseUserId);

    return this.db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, neonUser.id))
      .orderBy(desc(journalEntries.createdAt));
  }

  /* ─────────────────────────────────────────────────────────
   * Get a single journal entry (ownership enforced)
   * ───────────────────────────────────────────────────────── */

  async findOne(supabaseUserId: string, entryId: string) {
    const neonUser = await this.resolveUser(supabaseUserId);

    const results = await this.db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.id, entryId),
          eq(journalEntries.userId, neonUser.id),
        ),
      )
      .limit(1);

    if (!results[0]) {
      throw new NotFoundException('Journal entry not found');
    }

    return results[0];
  }

  /* ─────────────────────────────────────────────────────────
   * Update a journal entry (ownership enforced)
   * ───────────────────────────────────────────────────────── */

  async update(
    supabaseUserId: string,
    entryId: string,
    dto: UpdateJournalDto,
  ) {
    // Verify ownership before any update
    await this.findOne(supabaseUserId, entryId);

    const [updated] = await this.db
      .update(journalEntries)
      .set({
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, entryId))
      .returning();

    return updated;
  }

  /* ─────────────────────────────────────────────────────────
   * Delete a journal entry (ownership enforced)
   * ───────────────────────────────────────────────────────── */

  async remove(supabaseUserId: string, entryId: string) {
    // Verify ownership before deletion
    await this.findOne(supabaseUserId, entryId);

    await this.db
      .delete(journalEntries)
      .where(eq(journalEntries.id, entryId));

    return { deleted: true };
  }

  /* ─────────────────────────────────────────────────────────
   * Private: resolve Neon user from Supabase ID
   * ───────────────────────────────────────────────────────── */

  private async resolveUser(supabaseId: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);

    if (!result[0]) {
      throw new NotFoundException('User not found in database');
    }

    return result[0];
  }
}
