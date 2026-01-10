import { Injectable, NestMiddleware } from '@nestjs/common';
import cookieSession from 'cookie-session';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CookieSessionMiddleware implements NestMiddleware {
  private readonly middleware = cookieSession({
    name: 'session',
    signed: false,
    secure: process.env.NODE_ENV === 'production', // allow HTTP locally
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.middleware(req, res, next);
  }
}
