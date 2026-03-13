import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './core/database/database.module.js';
import { AuthModule } from './core/auth/auth.module.js';
import { UserModule } from './modules/user/user.module.js';
import { MoodModule } from './modules/mood/mood.module.js';
import { JournalModule } from './modules/journal/journal.module.js';
import { AudioModule } from './modules/audio/audio.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { CloudinaryModule } from './core/cloudinary/cloudinary.module.js';
import { QuoteModule } from './modules/quote/quote.module.js';
import { NotificationModule } from './modules/notification/notification.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    /* ── Rate limiting: 60 requests per minute per IP ──── */
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),

    DatabaseModule,
    AuthModule,
    UserModule,
    MoodModule,
    JournalModule,
    AudioModule,
    ChatModule,
    CloudinaryModule,
    QuoteModule,
    NotificationModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

