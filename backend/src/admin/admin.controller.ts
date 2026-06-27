import { Controller, Get, Delete, Param, Post, Body, UseGuards, ForbiddenException, Request, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @Post('create-admin')
  async createAdmin(
    @Body() body: { email: string; password: string },
    @Headers('x-admin-setup-secret') setupSecret?: string,
  ) {
    const requiredSecret = this.configService.get<string>('ADMIN_SETUP_SECRET');
    if (requiredSecret && setupSecret !== requiredSecret) {
      throw new UnauthorizedException('Invalid admin setup secret');
    }
    if (!requiredSecret && this.configService.get<string>('NODE_ENV') === 'production') {
      throw new ForbiddenException('Admin setup is disabled in production');
    }
    const adminUser = await this.usersService.create({
      firstName: 'Admin',
      lastName: 'User',
      email: body.email,
      password: body.password,
      role: 'admin',
      authProvider: 'local',
    });

    return { message: 'Admin user created successfully', user: adminUser };
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers(@Request() req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.getAllUsers();
  }

  @Get('applications')
  @UseGuards(AuthGuard('jwt'))
  async getAllApplications(@Request() req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.getAllApplications();
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@Request() req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.getStats();
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.deleteUser(id);
  }

  @Delete('applications/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteApplication(@Param('id') id: string, @Request() req: any) {
    if (req.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.adminService.deleteApplication(id);
  }
}
