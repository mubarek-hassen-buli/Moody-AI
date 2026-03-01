import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { DRIZZLE } from '../../core/database/database.module.js';
import { audioTracks } from '../../core/database/schema.js';
import type * as schema from '../../core/database/schema.js';

type AudioCategory = 'relaxing' | 'workout';

@Injectable()
export class AudioService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  /**
   * Get all audio tracks for a given category, ordered by title.
   */
  async findByCategory(category: AudioCategory) {
    return this.db
      .select({
        id: audioTracks.id,
        title: audioTracks.title,
        duration: audioTracks.duration,
        category: audioTracks.category,
        audioUrl: audioTracks.audioUrl,
      })
      .from(audioTracks)
      .where(eq(audioTracks.category, category))
      .orderBy(audioTracks.title);
  }

  /**
   * Get all audio tracks regardless of category.
   */
  async findAll() {
    return this.db
      .select({
        id: audioTracks.id,
        title: audioTracks.title,
        duration: audioTracks.duration,
        category: audioTracks.category,
        audioUrl: audioTracks.audioUrl,
      })
      .from(audioTracks)
      .orderBy(audioTracks.category, audioTracks.title);
  }
}
