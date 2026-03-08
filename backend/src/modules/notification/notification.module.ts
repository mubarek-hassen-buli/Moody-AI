import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationService } from './notification.service.js';
import { NotificationController } from './notification.controller.js';
import { QuoteModule } from '../quote/quote.module.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    QuoteModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
