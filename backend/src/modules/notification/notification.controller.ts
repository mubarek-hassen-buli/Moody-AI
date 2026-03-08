import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SupabaseGuard } from '../../core/auth/supabase.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { NotificationService } from './notification.service.js';
import { RegisterTokenDto } from './dto/register-token.dto.js';

@Controller('notifications')
@UseGuards(SupabaseGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * POST /api/notifications/register
   * Registers or updates an Expo push token for the authenticated user.
   */
  @Post('register')
  async register(
    @CurrentUser() supabaseUser: any,
    @Body() dto: RegisterTokenDto,
  ) {
    await this.notificationService.registerToken(supabaseUser.id, dto.token);
    return { success: true };
  }
}
