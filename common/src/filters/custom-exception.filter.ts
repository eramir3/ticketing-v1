import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomError } from '../errors/custom-error'

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof CustomError) {
      return response.status(exception.statusCode).json({
        errors: exception.serializeErrors(),
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const payload =
        typeof res === 'object'
          ? res
          : {
            errors: [{ message: res }],
          };

      return response.status(status).json(payload);
    }

    console.error(exception)
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errors: [{ message: 'Something went wrong' }],
    });
  }
}
