import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from './neon-auth.guard.js';

export type { AuthenticatedUser };

/**
 * Extracts the authenticated user from the request.
 * Guaranteed to be present on routes protected by NeonAuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
