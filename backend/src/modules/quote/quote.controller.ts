import { Controller, Get, UseGuards } from '@nestjs/common';
import { NeonAuthGuard } from '../../core/auth/neon-auth.guard.js';
import { QuoteService } from './quote.service.js';

@Controller('quotes')
@UseGuards(NeonAuthGuard)
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
