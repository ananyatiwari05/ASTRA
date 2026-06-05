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
}
