import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req) {
  return req.user;
  }
  
  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(
      body.email,
      body.password,
    );
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }
}