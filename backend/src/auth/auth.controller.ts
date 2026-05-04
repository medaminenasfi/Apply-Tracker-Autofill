import { Controller, Post, Get, UseGuards, Request, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any, @Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(loginDto);
    
    // Set cookie based on user role
    const cookieName = result.user.role === 'admin' ? 'admin_token' : 'user_token';
    
    res.cookie(cookieName, result.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // dev only
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return result;
  }

  @Post('logout')
  async logout(@Request() req: any, @Res({ passthrough: true }) res: Response) {
    // Only clear the cookie matching the x-app-role header
    const appRole = req.headers['x-app-role'];
    if (appRole === 'admin') {
      res.clearCookie('admin_token', { path: '/' });
    } else {
      res.clearCookie('user_token', { path: '/' });
    }
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req: any, @Res() res: Response) {
    const { access_token, user } = await this.authService.googleLogin(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${access_token}`);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
