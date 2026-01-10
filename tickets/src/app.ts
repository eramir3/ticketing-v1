import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestValidationError, CustomExceptionFilter } from '@er3tickets/common'
import { kafkaWrapper } from './kafka-wrapper';

// Configures app instance
export async function appConfig() {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  if (!process.env.KAFKA_CLIENT_ID) {
    throw new Error('KAFKA_CLIENT_ID must be defined');
  }

  if (!process.env.KAFKA_URL) {
    throw new Error('KAFKA_URL must be defined');
  }

  try {
    kafkaWrapper.connect({ clientId: process.env.KAFKA_CLIENT_ID, brokers: [process.env.KAFKA_URL] })
  }
  catch (e) {
    console.log('Error')
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