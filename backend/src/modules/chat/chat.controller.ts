import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { NeonAuthGuard } from '../../core/auth/neon-auth.guard.js';
import type { AuthenticatedUser } from '../../core/auth/neon-auth.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@Controller('chat')
@UseGuards(NeonAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * GET /api/chat/history
   * Returns conversation history for the authenticated user.
   */
  @Get('history')
  async getHistory(@CurrentUser() user: AuthenticatedUser) {
    const messages = await this.chatService.getHistory(user.id);
    return { data: messages };
  }

  /**
   * POST /api/chat/send
   * Sends a user message to Gemini and returns the AI reply.
   */
  @Post('send')
  async sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SendMessageDto,
  ) {
    const result = await this.chatService.sendMessage(user.id, dto.message);
    return { data: result };
  }
}
