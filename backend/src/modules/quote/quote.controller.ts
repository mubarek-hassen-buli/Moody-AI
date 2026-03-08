import { Controller, Get, UseGuards } from '@nestjs/common';
import { SupabaseGuard } from '../../core/auth/supabase.guard.js';
import { QuoteService } from './quote.service.js';

@Controller('quotes')
@UseGuards(SupabaseGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  /**
   * GET /api/quotes/today
   * Returns the motivational quote for today.
   */
  @Get('today')
  async getToday() {
    const quote = await this.quoteService.getToday();
    return { data: quote };
  }
}
