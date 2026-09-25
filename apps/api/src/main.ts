import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { validateEnvironment } from './common/env-validation';

async function bootstrap() {
  // 1. Environment validation on boot per TRD requirements
  validateEnvironment();

  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));

  // 2. Dynamic CORS resolution from ALLOWED_ORIGINS env var
  const allowedOriginsRaw = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = allowedOriginsRaw
    ? allowedOriginsRaw.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`MockRoom Backend API is running on port ${port} with origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();
