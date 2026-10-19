import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NeonAuthGuard } from '../../core/auth/neon-auth.guard.js';
import type { AuthenticatedUser } from '../../core/auth/neon-auth.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { NotificationService } from './notification.service.js';
import { RegisterTokenDto } from './dto/register-token.dto.js';

@Controller('notifications')
@UseGuards(NeonAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * POST /api/notifications/register
   * Registers or updates an Expo push token for the authenticated user.
   */
  @Post('register')
  async register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RegisterTokenDto,
  ) {
    await this.notificationService.registerToken(user.id, dto.token);
    return { success: true };
  }
}
