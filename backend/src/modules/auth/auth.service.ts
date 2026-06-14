import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(
    email: string,
    password: string,
  ) {
    const existing =
      await this.usersService.findByEmail(email);

    if (existing) {
      throw new BadRequestException(
        'User already exists',
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      email,
      password: hash,
      provider: 'local',
    });

    return {
  access_token: this.jwtService.sign({
    sub: user.id,
    email: user.email,
  }),
  user: {
    id: user.id,
    email: user.email,
  },
};
  }

  async login(
    email: string,
    password: string,
  ) {
    const user =
      await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const valid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!valid) {
      throw new UnauthorizedException();
    }

    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
      }),
      user: {
      id: user.id,
      email: user.email
      }
    };
  }

  async socialLogin(userData: any, provider: 'google' | 'github') {
    const existingUser = await this.usersService.findByEmail(
      userData.email,
    );

    if (existingUser) {
      return {
  access_token: this.jwtService.sign({
    sub: existingUser.id,
    email: existingUser.email,
  }),
  user: {
    id: existingUser.id,
    email: existingUser.email,
  },
};
    }

    const createPayload: any = {
      email: userData.email,
      provider,
    };

    if (provider === 'google') {
      createPayload.googleId = userData.googleId;
    }

    if (provider === 'github') {
      createPayload.githubId = userData.githubId;
    }

    const newUser = await this.usersService.create(createPayload);

     return {
  access_token: this.jwtService.sign({
    sub: newUser.id,
    email: newUser.email,
  }),
  user: {
    id: newUser.id,
    email: newUser.email,
  },
};
  }

  async googleLogin(userData: any) {
    return this.socialLogin(userData, 'google');
  }

  async githubLogin(userData: any) {
    return this.socialLogin(userData, 'github');
  }
}
