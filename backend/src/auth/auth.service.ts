import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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

  private generateToken(user: any): string {
    const payload = { sub: user._id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private excludePassword(user: any) {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}
