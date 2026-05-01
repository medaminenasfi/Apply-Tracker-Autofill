import { Injectable } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { ApplicationsService } from '../applications/applications.service';

@Injectable()
export class ExtensionService {
  constructor(
    private profileService: ProfileService,
    private applicationsService: ApplicationsService,
  ) {}

  async getUserProfile(userId: string) {
    const profile = await this.profileService.findByUserId(userId);
    if (!profile) {
      return { message: 'Profile not found' };
    }
    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      university: profile.university,
      linkedin: profile.linkedin,
      portfolio: profile.portfolio,
      cvUrl: profile.cvUrl,
    };
  }

  async saveApplication(userId: string, applicationData: any) {
    const dateApplied = applicationData.dateApplied || new Date().toISOString();

    return this.applicationsService.create({
      ...applicationData,
      status: 'applied',
      dateApplied,
    }, userId);
  }
}
