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
      countryCode: profile.countryCode || '+216',
      university: profile.university,
      linkedin: profile.linkedin,
      portfolio: profile.portfolio,
      cvUrl: profile.cvUrl,
    };
  }

  async saveApplication(userId: string, applicationData: any) {
    console.log('Extension saveApplication called with:', applicationData);
    
    // Filter out empty values for optional fields
    const filteredData: any = {
      companyName: applicationData.companyName,
      position: applicationData.position,
    };
    
    if (applicationData.jobUrl && applicationData.jobUrl.trim()) {
      filteredData.jobUrl = applicationData.jobUrl.trim();
    }
    
    if (applicationData.note && applicationData.note.trim()) {
      filteredData.note = applicationData.note.trim();
    }
    
    let dateApplied = applicationData.dateApplied;
    
    if (dateApplied) {
      console.log('Original dateApplied:', dateApplied);
      // If date is in YYYY-MM-DD format, create a Date object with local timezone
      if (dateApplied.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateApplied.split('-').map(Number);
        const localDate = new Date(year, month - 1, day, 12, 0, 0); // Noon to avoid timezone issues
        console.log('Local date created:', localDate);
        dateApplied = localDate.toISOString();
        console.log('ISO date:', dateApplied);
      }
      filteredData.dateApplied = dateApplied;
    } else {
      filteredData.dateApplied = new Date().toISOString();
      console.log('No date provided, using current time:', filteredData.dateApplied);
    }

    const result = await this.applicationsService.create({
      ...filteredData,
      status: 'applied',
    }, userId);
    console.log('Application created with dateApplied:', result.dateApplied);
    return result;
  }
}
