import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.module.js';
import { users } from '../../core/database/schema.js';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type * as schema from '../../core/database/schema.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  /**
   * Find or create a user by their Supabase ID.
   * Called after every successful auth to ensure the user exists in Neon.
   */
  async upsertFromSupabase(supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: { name?: string; avatar_url?: string };
  }) {
    const existing = await this.db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseUser.id))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [newUser] = await this.db
      .insert(users)
      .values({
        supabaseId: supabaseUser.id,
        email: supabaseUser.email ?? '',
        name: supabaseUser.user_metadata?.name ?? null,
        avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
      })
      .returning();

    return newUser;
  }

  /**
   * Find a user by their Supabase ID.
   */
  async findBySupabaseId(supabaseId: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.supabaseId, supabaseId))
      .limit(1);

    return result[0] ?? null;
  }

  /**
   * Update a user's display name.
   */
  async updateName(supabaseId: string, dto: UpdateProfileDto) {
    const existing = await this.findBySupabaseId(supabaseId);
    if (!existing) throw new Error('User not found');

    const [updated] = await this.db
      .update(users)
      .set({
        ...(dto.name !== undefined && { name: dto.name }),
        updatedAt: new Date(),
      })
      .where(eq(users.supabaseId, supabaseId))
      .returning();

    return updated;
  }
}
