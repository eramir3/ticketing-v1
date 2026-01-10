import { All, Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { SignUpDto } from './dto/signup.dto';
import { NotFoundError } from '@er3tickets/common'
import { type Request, type Response } from 'express';
import { SignInDto } from './dto/signin.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('/api/users/signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: SignUpDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.appService.signUp(dto, req, res);
  }

  @Post('/api/users/signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: SignInDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.appService.signIn(dto, req, res)
  }

  @Post('/api/users/signout')
  @HttpCode(HttpStatus.OK)
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.appService.signOut(req, res)
  }

  @Get('/api/users/currentUser')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return await this.appService.getCurrentUser(req, res)
  }

  @All('*')
  @HttpCode(HttpStatus.NOT_FOUND)
  async handleNotFound() {
    throw new NotFoundError();
  }

}
