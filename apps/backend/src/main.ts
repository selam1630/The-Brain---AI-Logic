/**
 * Main Application Entry Point
 * Bootstraps the NestJS application with all modules and middleware
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set API prefix
  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT', 3001);
  const env = configService.get<string>('NODE_ENV', 'development');

  await app.listen(port, () => {
    logger.log(
      `🚀 Server is running on http://localhost:${port} [${env}]`,
    );
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
