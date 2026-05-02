import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { UsersService } from '../users/users.service';
import { normalizeUserId, validateUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    private usersService: UsersService,
  ) {}

  async findByUserId(userId: UserId): Promise<Profile | null> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    return this.profileModel.findOne({ userId: userIdString }).exec();
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
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    const profile = await this.findByUserId(userIdString);

    if (!profile) {
      // Create profile if it doesn't exist
      return this.create({ 
        userId: userIdString, 
        cvUrl,
        firstName: userInfo?.firstName || '',
        lastName: userInfo?.lastName || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        university: userInfo?.university || '',
        linkedin: userInfo?.linkedin || '',
        portfolio: userInfo?.portfolio || '',
      });
    }

    return this.profileModel
      .findOneAndUpdate({ userId: userIdString }, { cvUrl }, { returnDocument: 'after' })
      .exec();
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
