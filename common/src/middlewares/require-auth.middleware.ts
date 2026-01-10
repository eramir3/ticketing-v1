import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from 'src/errors/not-authorized-error';

@Injectable()
export class RequireAuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }
    next();
  }
}