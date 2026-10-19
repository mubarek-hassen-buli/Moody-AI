import { Module } from '@nestjs/common';
import { NeonAuthGuard } from './neon-auth.guard.js';

@Module({
  providers: [NeonAuthGuard],
  exports: [NeonAuthGuard],
})
export class AuthModule {}
