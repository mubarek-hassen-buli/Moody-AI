import { Module } from '@nestjs/common';
import { JournalService } from './journal.service.js';
import { JournalController } from './journal.controller.js';

@Module({
  controllers: [JournalController],
  providers: [JournalService],
})
export class JournalModule {}
