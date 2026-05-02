import { Injectable } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { ApplicationsService } from '../applications/applications.service';
import { normalizeUserId, validateUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class ExtensionService {
  constructor(
    private profileService: ProfileService,
    private applicationsService: ApplicationsService,
  ) {}

  async getUserProfile(userId: UserId) {
    const userIdString = normalizeUserId(userId);
    const profile = await this.profileService.findByUserId(userIdString);
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

  async saveApplication(userId: UserId, applicationData: any) {
    const userIdString = normalizeUserId(userId);
    console.log('[EXTENSION_SAVE_APP] userId:', userIdString, 'type:', typeof userIdString);
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
      // If date is in YYYY-MM-DD format, use current local time with that date
      if (dateApplied.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const now = new Date();
        const [year, month, day] = dateApplied.split('-').map(Number);
        // Create date with the provided date and current local time
        const localDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
        console.log('Local date created:', localDate);
        dateApplied = localDate.toISOString();
        console.log('ISO date:', dateApplied);
      }
      filteredData.dateApplied = dateApplied;
    } else {
      // Use current UTC time if no date provided
      filteredData.dateApplied = new Date().toISOString();
      console.log('No date provided, using current UTC time:', filteredData.dateApplied);
    }

    const result = await this.applicationsService.create({
      ...filteredData,
      status: 'applied',
    }, userIdString);
    console.log('Application created with dateApplied:', result.dateApplied);
    return result;
  }
}
