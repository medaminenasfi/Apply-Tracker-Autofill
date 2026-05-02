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
    
    // Get count of regular users only (exclude admins)
    const allUsers = await this.usersService.findAll();
    const regularUsersCount = allUsers.filter((user: any) => user.role !== 'admin').length;

    // Transform array to object for easier frontend consumption
    const statusMap: any = {
      applied: 0,
      pending: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    };

    applicationsByStatus.forEach((stat: any) => {
      statusMap[stat._id] = stat.count;
    });

    return {
      totalUsers: regularUsersCount,
      totalApplications,
      applicationsByStatus: statusMap,
    };
  }

  async deleteUser(id: string) {
    return this.usersService.delete(id);
  }

  async deleteApplication(id: string) {
    return this.applicationsService.deleteByAdmin(id);
  }
}
