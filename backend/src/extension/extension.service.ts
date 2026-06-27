import { Injectable } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { ApplicationsService } from '../applications/applications.service';
import { AiService } from '../ai/ai.service';
import { CvTextService } from '../common/services/cv-text.service';
import { normalizeUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class ExtensionService {
  constructor(
    private profileService: ProfileService,
    private applicationsService: ApplicationsService,
    private aiService: AiService,
    private cvTextService: CvTextService,
  ) {}

  async getUserProfile(userId: UserId, plan = 'free') {
    const userIdString = normalizeUserId(userId);
    const profile = await this.profileService.findByUserId(userIdString);
    if (!profile) {
      return { message: 'Profile not found', plan };
    }
    const cvList = await this.profileService.getCvList(userIdString);
    return {
      plan,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      countryCode: profile.countryCode || '+216',
      university: profile.university,
      linkedin: profile.linkedin,
      portfolio: profile.portfolio,
      address: profile.address,
      skills: profile.skills || [],
      cvUrl: cvList.cvUrl,
      primaryCvId: cvList.primaryCvId,
      cvs: cvList.cvs,
    };
  }

  async saveApplication(userId: UserId, applicationData: any) {
    const userIdString = normalizeUserId(userId);
    console.log('[EXTENSION_SAVE_APP] userId:', userIdString, 'type:', typeof userIdString);
    console.log('Extension saveApplication called with:', applicationData);
    
    const filteredData: any = {
      companyName: applicationData.companyName,
      position: applicationData.position,
      jobUrl: (applicationData.jobUrl && applicationData.jobUrl.trim()) || 'https://unknown',
      source: applicationData.source || 'extension',
      status: 'applied',
    };
    
    if (applicationData.note && applicationData.note.trim()) {
      filteredData.note = applicationData.note.trim();
    }
    
    let dateApplied = applicationData.dateApplied;
    
    if (dateApplied) {
      if (dateApplied.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const now = new Date();
        const [year, month, day] = dateApplied.split('-').map(Number);
        dateApplied = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
      }
      filteredData.dateApplied = dateApplied;
    } else {
      filteredData.dateApplied = new Date().toISOString();
    }

    const result = await this.applicationsService.create(filteredData, userIdString);
    return result;
  }

  async analyzeJob(userId: UserId, jobDescription: string, cvText?: string) {
    const userIdString = normalizeUserId(userId);
    let resolvedCvText = cvText || '';
    if (!resolvedCvText) {
      const cvList = await this.profileService.getCvList(userIdString);
      if (cvList.cvUrl) {
        resolvedCvText = await this.cvTextService.extractFromCvUrl(cvList.cvUrl);
      }
    }
    return this.aiService.analyzeJob(userIdString, jobDescription, resolvedCvText);
  }

  async ghostSave(userId: UserId, applicationData: any) {
    const userIdString = normalizeUserId(userId);
    const jobUrl = (applicationData.jobUrl && applicationData.jobUrl.trim()) || '';
    if (jobUrl && jobUrl !== 'https://unknown') {
      const existing = await this.applicationsService.findByJobUrl(userIdString, jobUrl);
      if (existing) {
        return { application: existing, deduplicated: true };
      }
    }
    const application = await this.saveApplication(userId, { ...applicationData, source: 'ghost' });
    return { application, deduplicated: false };
  }
}
