import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModel } from './models/user/user';
import { BadRequestError } from '@er3tickets/common'
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { SignInDto } from './dto/signin.dto';
import { Password } from './utils/password';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: UserModel,
  ) { }

  async signUp(dto: SignUpDto, req: Request, res: Response) {
    const existingUser = await this.userModel.findOne({ email: dto.email }).lean().exec();
    if (existingUser) {
      throw new BadRequestError('Email in use')
    }

    const user = this.userModel.build({
      email: dto.email,
      password: dto.password,
    });

    await user.save();

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt
    };

    res.send(user)
  }

  async signIn(dto: SignInDto, req: Request, res: Response) {
    const existingUser = await this.userModel.findOne({ email: dto.email }).lean().exec();

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      dto.password
    )

    if (!passwordsMatch) {
      throw new BadRequestError('Invalid Credentials');
    }

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt
    };

    res.send(existingUser);
  }

  async getCurrentUser(req: Request, res: Response) {
    res.send({ currentUser: req.currentUser ?? null })
  }

  async signOut(req: Request, res: Response) {
    req.session = null
    res.send({})
  }

  getHello(): string {
    return 'Listening on port 3000!';
  }
}
