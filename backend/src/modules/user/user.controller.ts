import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SupabaseGuard } from '../../core/auth/supabase.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { UserService } from './user.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

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

  /**
   * PATCH /api/user/me
   * Updates the current user's display name.
   */
  @Patch('me')
  async updateProfile(
    @CurrentUser() supabaseUser: any,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.userService.updateName(supabaseUser.id, dto);
    return { data: user };
  }
}
