import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  /* ── Security headers ─────────────────────────────────── */
  app.use(helmet());

  /* ── Body parsers (10 MB limit for base64 uploads) ───── */
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  /* ── Global API prefix ────────────────────────────────── */
  app.setGlobalPrefix('api');

  /* ── CORS — restrict to known origins ─────────────────── */
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  /* ── Global validation ────────────────────────────────── */
  app.useGlobalPipes(new ZodValidationPipe());

  /* ── Start server ─────────────────────────────────────── */
  const port = process.env.PORT ?? 3000;
  const server = await app.listen(port);

  console.log(`🚀 Moody-AI backend running on port ${port}`);

  /* ── Graceful shutdown ────────────────────────────────── */
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received — shutting down gracefully');
    await server.close();
    process.exit(0);
  });
}

bootstrap();
