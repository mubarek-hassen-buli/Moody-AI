import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the authenticated Supabase user from the request.
 *
 * Usage:
 *   @Get('me')
 *   getProfile(@CurrentUser() user: SupabaseUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
