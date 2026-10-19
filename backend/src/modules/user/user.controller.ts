import { Body, Controller, Get, Logger, Patch, UseGuards } from '@nestjs/common';
import { NeonAuthGuard } from '../../core/auth/neon-auth.guard.js';
import type { AuthenticatedUser } from '../../core/auth/neon-auth.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { UserService } from './user.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Controller('user')
@UseGuards(NeonAuthGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  /**
   * GET /api/user/me
   * Returns the current user's profile from Neon DB.
   */
  @Get('me')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.userService.findById(user.id);
    return { data: profile };
  }

  /**
   * PATCH /api/user/me
   * Updates the current user's profile (name and/or avatar stored in Neon Object Storage).
   */
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    this.logger.log(`Profile update requested for user: ${user.id}`);
    const updated = await this.userService.updateProfile(user.id, dto);
    return { data: updated };
  }
}
