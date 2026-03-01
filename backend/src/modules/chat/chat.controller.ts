import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SupabaseGuard } from '../../core/auth/supabase.guard.js';
import { CurrentUser } from '../../core/auth/current-user.decorator.js';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

@Controller('chat')
@UseGuards(SupabaseGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * GET /api/chat/history
   * Returns the conversation history for the authenticated user.
   */
  @Get('history')
  async getHistory(@CurrentUser() supabaseUser: any) {
    const messages = await this.chatService.getHistory(supabaseUser.id);
    return { data: messages };
  }

  /**
   * POST /api/chat/send
   * Sends a user message to Gemini and returns the AI reply.
   * Body: { message: string }
   */
  @Post('send')
  async sendMessage(
    @CurrentUser() supabaseUser: any,
    @Body() dto: SendMessageDto,
  ) {
    const result = await this.chatService.sendMessage(supabaseUser.id, dto.message);
    return { data: result };
  }
}
