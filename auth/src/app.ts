import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestValidationError, CustomExceptionFilter } from '@er3tickets/common'

// Configures app instance
export async function appConfig() {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => new RequestValidationError(errors),
    }),
  );
  app.useGlobalFilters(new CustomExceptionFilter());
  return { app }
}
