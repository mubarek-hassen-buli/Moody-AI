import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../../core/database/database.module.js';
import { journalEntries } from '../../core/database/schema.js';
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

  async create(userId: string, dto: CreateJournalDto) {
    const [entry] = await this.db
      .insert(journalEntries)
      .values({
        userId,
        title: dto.title,
        content: dto.content,
      })
      .returning();

    return entry;
  }

  /* ─────────────────────────────────────────────────────────
   * Get all journal entries for the user (newest first)
   * ───────────────────────────────────────────────────────── */

  async findAll(userId: string, limit = 100) {
    return this.db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }

  /* ─────────────────────────────────────────────────────────
   * Get a single journal entry (ownership enforced)
   * ───────────────────────────────────────────────────────── */

  async findOne(userId: string, entryId: string) {
    const results = await this.db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.id, entryId),
          eq(journalEntries.userId, userId),
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
    userId: string,
    entryId: string,
    dto: UpdateJournalDto,
  ) {
    // Verify ownership before any update
    await this.findOne(userId, entryId);

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

  async remove(userId: string, entryId: string) {
    // Verify ownership before deletion
    await this.findOne(userId, entryId);

    await this.db
      .delete(journalEntries)
      .where(eq(journalEntries.id, entryId));

    return { deleted: true };
  }
}
