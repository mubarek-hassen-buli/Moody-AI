import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTVerifyGetKey } from 'jose';
import { eq, sql } from 'drizzle-orm';
import { Request } from 'express';
import { DRIZZLE } from '../database/database.module.js';
import { users } from '../database/schema.js';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import type * as schema from '../database/schema.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

@Injectable()
export class NeonAuthGuard implements CanActivate {
  private readonly logger = new Logger(NeonAuthGuard.name);
  private jwks: JWTVerifyGetKey | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject(DRIZZLE)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {
    const jwksUrl = this.configService.get<string>('NEON_AUTH_JWKS_URL');
    if (jwksUrl) {
      try {
        this.jwks = createRemoteJWKSet(new URL(jwksUrl));
        this.logger.log(`Initialized JWKS verifier for: ${jwksUrl}`);
      } catch (err) {
        this.logger.warn(`Could not initialize JWKS from URL: ${jwksUrl}`);
      }
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    let authUser: { id: string; email: string; name?: string } | null = null;

    // 1. First attempt: Verify as signed JWT via Neon Auth JWKS
    if (this.jwks) {
      try {
        const { payload } = await jwtVerify(token, this.jwks);
        if (payload.sub) {
          authUser = {
            id: payload.sub,
            email: (payload.email as string) ?? '',
            name: (payload.name as string) ?? null,
          };
        }
      } catch (jwtErr) {
        // Token might be an opaque session token, fallback to DB session lookup
        this.logger.debug(`JWKS verification skipped/failed: ${(jwtErr as Error).message}`);
      }
    }

    // 2. Second attempt: Check session in database (neon_auth.session table)
    if (!authUser) {
      try {
        const sessionResult = await this.db.execute(
          sql`SELECT s.user_id, u.email, u.name, u.image 
              FROM neon_auth.session s 
              JOIN neon_auth.user u ON s.user_id = u.id 
              WHERE s.token = ${token} AND s.expires_at > NOW() 
              LIMIT 1`,
        );

        const row = (sessionResult as any).rows?.[0] ?? (sessionResult as any)[0];
        if (row) {
          authUser = {
            id: row.user_id,
            email: row.email,
            name: row.name,
          };
        }
      } catch (dbErr) {
        this.logger.debug(`Database session lookup skipped: ${(dbErr as Error).message}`);
      }
    }

    if (!authUser) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }

    // Ensure user profile row exists in our public users table
    await this.ensureUserProfile(authUser);

    // Attach strongly-typed user directly to request
    request.user = {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name ?? null,
    };

    return true;
  }

  private async ensureUserProfile(user: { id: string; email: string; name?: string }): Promise<void> {
    try {
      await this.db
        .insert(users)
        .values({
          id: user.id,
          email: user.email,
          name: user.name ?? null,
        })
        .onConflictDoNothing({ target: users.id });
    } catch (err) {
      this.logger.warn(`ensureUserProfile non-fatal warning: ${(err as Error).message}`);
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type === 'Bearer' && token) return token;
    }

    // Also support token passed in cookies if applicable
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
      if (match) return match[1];
    }

    return null;
  }
}
