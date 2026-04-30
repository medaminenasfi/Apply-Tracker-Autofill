import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ApplicationsService } from '../applications/applications.service';

@Injectable()
export class AdminService {
  constructor(
    private usersService: UsersService,
    private applicationsService: ApplicationsService,
  ) {}

  async getAllUsers() {
    return this.usersService.findAll();
  }

  async getAllApplications() {
    return this.applicationsService.findAll();
  }

  async getStats() {
    const totalUsers = await this.usersService.getTotalCount();
    const totalApplications = await this.applicationsService.getTotalCount();
    const applicationsByStatus = await this.applicationsService.getStatsByStatus();

    return {
      totalUsers,
      totalApplications,
      applicationsByStatus,
    };
  }

  async deleteUser(id: string) {
    return this.usersService.delete(id);
  }

  async deleteApplication(id: string) {
    return this.applicationsService.deleteByAdmin(id);
  }
}
