import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module.js';
import { AuthModule } from './core/auth/auth.module.js';
import { UserModule } from './modules/user/user.module.js';
import { MoodModule } from './modules/mood/mood.module.js';
import { JournalModule } from './modules/journal/journal.module.js';
import { AudioModule } from './modules/audio/audio.module.js';
import { ChatModule } from './modules/chat/chat.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    UserModule,
    MoodModule,
    JournalModule,
    AudioModule,
    ChatModule,
  ],
})
export class AppModule {}
