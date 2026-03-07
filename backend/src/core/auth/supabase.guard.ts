import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
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
   * Lightweight find-or-create for the Neon users table.
   * Runs on every request, but the SELECT is fast (indexed on supabaseId).
   * Only INSERTs on the very first request from a new user.
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

      console.log(`[SupabaseGuard] Creating Neon user for Supabase ID: ${supabaseUser.id}`);

      await this.db.insert(users).values({
        supabaseId: supabaseUser.id,
        email: supabaseUser.email ?? '',
        name: supabaseUser.user_metadata?.name ?? null,
        avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
      });

      console.log(`[SupabaseGuard] ✅ Neon user created successfully`);
    } catch (err) {
      // Race condition: another request may have inserted between SELECT and INSERT.
      // That's fine — the user exists either way.
      console.warn('[SupabaseGuard] ensureNeonUser warning:', (err as Error).message);
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}

