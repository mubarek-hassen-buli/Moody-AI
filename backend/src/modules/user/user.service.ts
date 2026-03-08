import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.module.js';
import { users } from '../../core/database/schema.js';
import { CloudinaryService } from '../../core/cloudinary/cloudinary.service.js';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type * as schema from '../../core/database/schema.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
    private readonly cloudinary: CloudinaryService,
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
   * Update a user's profile (name and/or avatar).
   * If avatarBase64 is provided, uploads the image to Cloudinary first.
   */
  async updateProfile(supabaseId: string, dto: UpdateProfileDto) {
    this.logger.log(`updateProfile called for ${supabaseId}`);
    this.logger.log(`DTO keys: ${Object.keys(dto)}`);
    this.logger.log(`Has avatarBase64: ${!!dto.avatarBase64}, length: ${dto.avatarBase64?.length ?? 0}`);

    const existing = await this.findBySupabaseId(supabaseId);
    if (!existing) throw new Error('User not found');

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) {
      updates.name = dto.name;
    }

    if (dto.avatarBase64) {
      this.logger.log(`Uploading avatar for user ${supabaseId}`);
      const avatarUrl = await this.cloudinary.uploadImage(dto.avatarBase64);
      this.logger.log(`Cloudinary URL: ${avatarUrl}`);
      updates.avatarUrl = avatarUrl;
    } else {
      this.logger.warn('No avatarBase64 found in DTO — skipping upload');
    }

    const [updated] = await this.db
      .update(users)
      .set(updates)
      .where(eq(users.supabaseId, supabaseId))
      .returning();

    return updated;
  }
}
