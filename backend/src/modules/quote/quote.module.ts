import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service.js';
import { QuoteController } from './quote.controller.js';

@Module({
  controllers: [QuoteController],
  providers: [QuoteService],
  exports: [QuoteService],
})
export class QuoteModule {}
