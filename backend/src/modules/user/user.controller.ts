import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseGuard } from '../../core/auth/supabase.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { UserService } from './user.service.js';

@Controller('user')
@UseGuards(SupabaseGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /api/user/me
   * Returns the current user's profile.
   * If the user doesn't exist in Neon yet, creates them automatically.
   */
  @Get('me')
  async getProfile(@CurrentUser() supabaseUser: any) {
    const user = await this.userService.upsertFromSupabase(supabaseUser);
    return { data: user };
  }
}
