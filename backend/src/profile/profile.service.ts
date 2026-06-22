import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as path from 'path';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { CvDocument } from './schemas/cv-document.schema';
import { UsersService } from '../users/users.service';
import { normalizeUserId, validateUserId, UserId } from '../common/utils/userId.util';

export interface CvListItem {
  _id: string;
  label: string;
  filename: string;
  url: string;
  uploadedAt: Date;
  isPrimary: boolean;
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    private usersService: UsersService,
  ) {}

  async findByUserId(userId: UserId): Promise<Profile | null> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    const profile = await this.profileModel.findOne({ userId: userIdString }).exec();
    if (!profile) return null;
    return this.ensureCvMigration(profile as ProfileDocument);
  }

  private getPrimaryCv(profile: Profile): CvDocument | null {
    const cvs = profile.cvs || [];
    if (cvs.length === 0) return null;

    if (profile.primaryCvId) {
      const primary = cvs.find((cv) => String(cv._id) === profile.primaryCvId);
      if (primary) return primary;
    }

    return cvs[0];
  }

  private formatCvList(profile: Profile): CvListItem[] {
    const primaryId = profile.primaryCvId || (profile.cvs?.[0] ? String(profile.cvs[0]._id) : null);

    return (profile.cvs || []).map((cv) => ({
      _id: String(cv._id),
      label: cv.label,
      filename: cv.filename,
      url: cv.url,
      uploadedAt: cv.uploadedAt,
      isPrimary: String(cv._id) === primaryId,
    }));
  }

  async ensureCvMigration(profile: ProfileDocument): Promise<ProfileDocument> {
    if (profile.cvUrl && (!profile.cvs || profile.cvs.length === 0)) {
      const filename = path.basename(profile.cvUrl);
      const cvDoc = {
        label: filename,
        filename,
        url: profile.cvUrl,
        uploadedAt: new Date(),
      };

      const updated = await this.profileModel
        .findOneAndUpdate(
          { userId: profile.userId },
          { $set: { cvs: [cvDoc] } },
          { returnDocument: 'after' },
        )
        .exec();

      if (updated?.cvs?.[0]) {
        const primaryId = String(updated.cvs[0]._id);
        return this.profileModel
          .findOneAndUpdate(
            { userId: profile.userId },
            { $set: { primaryCvId: primaryId, cvUrl: profile.cvUrl } },
            { returnDocument: 'after' },
          )
          .exec() as Promise<ProfileDocument>;
      }
    }

    return profile;
  }

  async getCvList(userId: UserId) {
    const profile = await this.findByUserId(userId);
    if (!profile) {
      return { cvs: [], primaryCvId: null, hasCV: false, cvUrl: null, filename: null };
    }

    const primary = this.getPrimaryCv(profile);
    return {
      cvs: this.formatCvList(profile),
      primaryCvId: primary ? String(primary._id) : null,
      hasCV: (profile.cvs?.length || 0) > 0,
      cvUrl: primary?.url || null,
      filename: primary?.filename || null,
    };
  }

  async getCvById(userId: UserId, cvId: string): Promise<CvDocument | null> {
    const profile = await this.findByUserId(userId);
    if (!profile?.cvs?.length) return null;
    return profile.cvs.find((cv) => String(cv._id) === cvId) || null;
  }

  async addCv(
    userId: UserId,
    cvData: { label: string; filename: string; url: string },
    userInfo?: any,
  ): Promise<Profile | null> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    let profile: ProfileDocument | null = await this.profileModel.findOne({ userId: userIdString }).exec();

    if (!profile) {
      const created = await this.create({
        userId: userIdString,
        firstName: userInfo?.firstName || '',
        lastName: userInfo?.lastName || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        university: userInfo?.university || '',
        linkedin: userInfo?.linkedin || '',
        portfolio: userInfo?.portfolio || '',
        cvs: [],
      });
      profile = created as ProfileDocument;
    }

    const currentCvs = profile.cvs || [];
    if (currentCvs.length >= 10) {
      throw new BadRequestException('Maximum of 10 CVs allowed');
    }

    const newCv = {
      label: cvData.label,
      filename: cvData.filename,
      url: cvData.url,
      uploadedAt: new Date(),
    };

    const isFirstCv = currentCvs.length === 0;
    const updatedProfile = await this.profileModel
      .findOneAndUpdate(
        { userId: userIdString },
        {
          $push: { cvs: newCv },
          ...(isFirstCv ? { $set: { cvUrl: cvData.url } } : {}),
        },
        { returnDocument: 'after' },
      )
      .exec();

    if (isFirstCv && updatedProfile?.cvs?.length) {
      const primaryId = String(updatedProfile.cvs[updatedProfile.cvs.length - 1]._id);
      return this.profileModel
        .findOneAndUpdate(
          { userId: userIdString },
          { $set: { primaryCvId: primaryId, cvUrl: cvData.url } },
          { returnDocument: 'after' },
        )
        .exec();
    }

    return updatedProfile;
  }

  async deleteCvById(userId: UserId, cvId: string): Promise<Profile | null> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    const profile = await this.findByUserId(userIdString);

    if (!profile?.cvs?.length) {
      throw new NotFoundException('CV not found');
    }

    const cvToDelete = profile.cvs.find((cv) => String(cv._id) === cvId);
    if (!cvToDelete) {
      throw new NotFoundException('CV not found');
    }

    const wasPrimary = profile.primaryCvId === cvId || String(profile.cvs[0]._id) === cvId;
    const remainingCvs = profile.cvs.filter((cv) => String(cv._id) !== cvId);

    let updateData: Record<string, unknown> = {
      cvs: remainingCvs,
    };

    if (wasPrimary) {
      if (remainingCvs.length > 0) {
        const nextPrimary = remainingCvs[0];
        updateData = {
          ...updateData,
          primaryCvId: String(nextPrimary._id),
          cvUrl: nextPrimary.url,
        };
      } else {
        updateData = {
          ...updateData,
          primaryCvId: null,
          cvUrl: null,
        };
      }
    }

    return this.profileModel
      .findOneAndUpdate({ userId: userIdString }, { $set: updateData }, { returnDocument: 'after' })
      .exec();
  }

  async setPrimaryCv(userId: UserId, cvId: string): Promise<Profile | null> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    const profile = await this.findByUserId(userIdString);

    if (!profile?.cvs?.length) {
      throw new NotFoundException('No CVs found');
    }

    const cv = profile.cvs.find((item) => String(item._id) === cvId);
    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    return this.profileModel
      .findOneAndUpdate(
        { userId: userIdString },
        { $set: { primaryCvId: cvId, cvUrl: cv.url } },
        { returnDocument: 'after' },
      )
      .exec();
  }

  async migrateOldFieldNames() {
    console.log('Starting migration of old field names...');
    const profiles = await this.profileModel.find({}).exec();
    
    for (const profile of profiles) {
      const updateData: any = {};
      
      // Migrate phoneNumber -> phone
      if ((profile as any).phoneNumber && !(profile as any).phone) {
        updateData.phone = (profile as any).phoneNumber;
      }
      
      // Migrate linkedinUrl -> linkedin
      if ((profile as any).linkedinUrl && !(profile as any).linkedin) {
        updateData.linkedin = (profile as any).linkedinUrl;
      }
      
      // Migrate portfolioUrl -> portfolio
      if ((profile as any).portfolioUrl && !(profile as any).portfolio) {
        updateData.portfolio = (profile as any).portfolioUrl;
      }
      
      if (Object.keys(updateData).length > 0) {
        await this.profileModel.updateOne(
          { _id: profile._id },
          { 
            $set: updateData,
            $unset: { phoneNumber: 1, linkedinUrl: 1, portfolioUrl: 1 }
          }
        );
        console.log(`Migrated profile ${profile._id}`);
      }
    }
    
    console.log('Migration completed');
  }

  async create(profileData: any): Promise<Profile> {
    console.log('Creating profile with data:', profileData);
    const createdProfile = new this.profileModel(profileData);
    return createdProfile.save();
  }

  async update(userId: UserId, updateData: any): Promise<Profile | null> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    console.log('[PROFILE_UPDATE] userId:', userIdString, 'type:', typeof userIdString);
    console.log('Profile update called with data:', updateData);
    const profile = await this.findByUserId(userIdString);

    if (!profile) {
      console.log('Profile not found, creating new profile');
      return this.create({ ...updateData, userId: userIdString });
    }

    console.log('Profile found, updating existing profile');
    console.log('Current profile:', profile);
    
    // Preserve fields that are not being updated
    const preservedFields: any = {};
    if ((profile as any).profilePictureUrl && !updateData.profilePictureUrl) {
      preservedFields.profilePictureUrl = (profile as any).profilePictureUrl;
    }
    if ((profile as any).cvs && !updateData.cvs) {
      preservedFields.cvs = (profile as any).cvs;
    }
    if ((profile as any).primaryCvId && !updateData.primaryCvId) {
      preservedFields.primaryCvId = (profile as any).primaryCvId;
    }
    if ((profile as any).cvUrl && !updateData.cvUrl) {
      preservedFields.cvUrl = (profile as any).cvUrl;
    }
    
    const finalUpdateData = { ...updateData, ...preservedFields };
    console.log('Final update data:', finalUpdateData);
    
    const updatedProfile = await this.profileModel
      .findOneAndUpdate({ userId: userIdString }, { $set: finalUpdateData }, { returnDocument: 'after' })
      .exec();
    
    console.log('Updated profile:', updatedProfile);

    if (updateData.firstName || updateData.lastName || updateData.email) {
      const userUpdateData: any = {};
      if (updateData.firstName) userUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) userUpdateData.lastName = updateData.lastName;
      if (updateData.email) userUpdateData.email = updateData.email;

      console.log('Updating User collection with:', userUpdateData);
      const updatedUser = await this.usersService.updateUser(userIdString, userUpdateData);
      console.log('Updated user:', updatedUser);
    }

    return updatedProfile;
  }

  async updateCvUrl(userId: UserId, cvUrl: string | null, userInfo?: any): Promise<Profile | null> {
    if (cvUrl === null) {
      return this.profileModel
        .findOneAndUpdate(
          { userId: normalizeUserId(userId) },
          { $set: { cvUrl: null, primaryCvId: null, cvs: [] } },
          { returnDocument: 'after' },
        )
        .exec();
    }

    const filename = path.basename(cvUrl);
    return this.addCv(
      userId,
      { label: filename, filename, url: cvUrl },
      userInfo,
    );
  }

  async updateProfilePictureUrl(userId: UserId, profilePictureUrl: string | null): Promise<Profile | null> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    const profile = await this.findByUserId(userIdString);

    if (!profile) {
      // Create profile if it doesn't exist
      return this.create({ 
        userId: userIdString, 
        profilePictureUrl,
        firstName: '',
        lastName: '',
        email: '',
      });
    }

    return this.profileModel
      .findOneAndUpdate({ userId: userIdString }, { profilePictureUrl }, { returnDocument: 'after' })
      .exec();
  }
}
