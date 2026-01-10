import { ValidationError } from 'class-validator';
import { CustomError, SerializedError } from './custom-error';

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(private readonly errors: ValidationError[]) {
    super('Invalid request parameters');
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors(): SerializedError[] {
    return this.errors.map((error) => {
      const constraintMessages = error.constraints
        ? Object.values(error.constraints)
        : [];
      return {
        message: constraintMessages[0] ?? 'Invalid value',
        field: error.property,
      };
    });
  }
}
