import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../common/services/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.usersService.create(registerDto);
    const token = this.generateToken(user);

    return {
      access_token: token,
      user: this.excludePassword(user),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      access_token: token,
      user: this.excludePassword(user),
    };
  }

  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }

  async googleLogin(user: any) {
    const token = this.generateToken(user);
    return {
      access_token: token,
      user: this.excludePassword(user),
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const resetToken = await this.usersService.generateResetToken(forgotPasswordDto.email);
    
    // Send email with reset link
    try {
      await this.emailService.sendPasswordResetEmail(forgotPasswordDto.email, resetToken);
      return {
        message: 'Password reset email sent',
      };
    } catch (error) {
      // If email fails, return token for testing
      return {
        message: 'Password reset token generated (email failed)',
        resetToken,
        resetLink: `http://localhost:3000/auth/reset-password?token=${resetToken}`,
      };
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    await this.usersService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    
    return {
      message: 'Password reset successfully',
    };
  }

  private generateToken(user: any): string {
    const payload = { sub: user._id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private excludePassword(user: any) {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}
