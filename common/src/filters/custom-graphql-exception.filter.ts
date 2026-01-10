import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { CustomError } from '../errors/custom-error';

@Catch()
export class CustomGraphqlExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 🔴 Custom domain errors
    if (exception instanceof CustomError) {
      throw new GraphQLError(exception.message, {
        extensions: {
          code: exception.statusCode,
          errors: exception.serializeErrors(),
        },
      });
    }

    // 🔴 Nest HttpExceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      const errors =
        typeof response === 'object'
          ? (response as any).errors ?? [{ message: exception.message }]
          : [{ message: response }];

      throw new GraphQLError(exception.message, {
        extensions: {
          code: status,
          errors,
        },
      });
    }

    // 🔴 Unknown errors
    console.error(exception);

    throw new GraphQLError('Something went wrong', {
      extensions: {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: [{ message: 'Internal server error' }],
      },
    });
  }
}
