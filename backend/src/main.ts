import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API prefix
  app.setGlobalPrefix('api');

  // Enable CORS for mobile app
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global Zod validation pipe
  app.useGlobalPipes(new ZodValidationPipe());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Moody-AI backend running on http://localhost:${port}/api`);
}

bootstrap();
