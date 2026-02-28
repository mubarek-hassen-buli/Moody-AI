import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './core/database/database.module.js';
import { AuthModule } from './core/auth/auth.module.js';
import { UserModule } from './modules/user/user.module.js';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Core infrastructure
    DatabaseModule,
    AuthModule,

    // Domain modules
    UserModule,
  ],
})
export class AppModule {}
