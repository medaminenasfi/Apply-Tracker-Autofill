import { Controller, Get, Delete, Param, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';

@Controller('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private usersService: UsersService,
  ) {}

  @Post('create-admin')
  async createAdmin(@Body() body: { email: string; password: string }) {
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllApplications() {
    return this.adminService.getAllApplications();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getStats() {
    return this.adminService.getStats();
  }

  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Delete('applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteApplication(@Param('id') id: string) {
    return this.adminService.deleteApplication(id);
  }
}
