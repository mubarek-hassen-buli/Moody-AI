import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../../core/database/database.module.js';
import { users } from '../../core/database/schema.js';
import { StorageService } from '../../core/storage/storage.service.js';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type * as schema from '../../core/database/schema.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
    private readonly storage: StorageService,
  ) {}

  /**
   * Find a user by their unified Neon Auth ID.
   */
  async findById(userId: string) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result[0] ?? null;
  }

  /**
   * Update a user's profile (name and/or avatar).
   * If avatarBase64 is provided, uploads the image to Neon Object Storage.
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    this.logger.log(`updateProfile called for user: ${userId}`);

    const existing = await this.findById(userId);
    if (!existing) {
      throw new NotFoundException('User profile not found');
    }

    const updates: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) {
      updates.name = dto.name;
    }

    if (dto.avatarBase64) {
      this.logger.log(`Uploading avatar to Neon Object Storage for user ${userId}`);
      const avatarUrl = await this.storage.uploadImage(dto.avatarBase64, 'avatars');
      updates.avatarUrl = avatarUrl;
    }

    const [updated] = await this.db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    return updated;
  }
}
