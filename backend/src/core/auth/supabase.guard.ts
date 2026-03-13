import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import { Request } from 'express';
import { DRIZZLE } from '../database/database.module.js';
import { users } from '../database/schema.js';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type * as schema from '../database/schema.js';

/**
 * Guard that verifies the Supabase JWT from the Authorization header.
 * Attaches the authenticated user payload to `request.user`.
 *
 * Also ensures the user exists in Neon DB (auto-upsert on first request).
 * This makes the sync robust — no reliance on client-side calls.
 */
@Injectable()
export class SupabaseGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseGuard.name);
  private supabase: SupabaseClient;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_ANON_KEY'),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // ── Auto-upsert: ensure user exists in Neon ──────────────
    await this.ensureNeonUser(user);

    // Attach the Supabase user to the request object
    (request as any).user = user;
    return true;
  }

  /**
   * Atomic upsert for the Neon users table.
   *
   * Uses `onConflictDoNothing` so concurrent first-requests from the
   * same user never cause a duplicate-key error. This replaces the
   * earlier check-then-insert pattern that had a race condition.
   */
  private async ensureNeonUser(supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      const existing = await this.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.supabaseId, supabaseUser.id))
        .limit(1);

      if (existing.length > 0) return; // Already exists — no-op

      this.logger.log(`Creating Neon user for Supabase ID: ${supabaseUser.id}`);

      await this.db
        .insert(users)
        .values({
          supabaseId: supabaseUser.id,
          email: supabaseUser.email ?? '',
          name: supabaseUser.user_metadata?.name ?? null,
          avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
        })
        .onConflictDoNothing({ target: users.supabaseId });

      this.logger.log('Neon user created successfully');
    } catch (err) {
      this.logger.warn(`ensureNeonUser warning: ${(err as Error).message}`);
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
