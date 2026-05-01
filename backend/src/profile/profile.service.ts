import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(Profile.name) private profileModel: Model<ProfileDocument>) {}

  async findByUserId(userId: string): Promise<Profile | null> {
    return this.profileModel.findOne({ userId }).exec();
  }

  async create(profileData: any): Promise<Profile> {
    const createdProfile = new this.profileModel(profileData);
    return createdProfile.save();
  }

  async update(userId: string, updateData: any): Promise<Profile> {
    const profile = await this.findByUserId(userId);

    if (!profile) {
      // Create profile if it doesn't exist
      return this.create({ ...updateData, userId });
    }

    // Update existing profile
    const updatedProfile = await this.profileModel
      .findOneAndUpdate({ userId }, { $set: updateData }, { returnDocument: 'after' })
      .exec();

    return updatedProfile;
  }

  async updateCvUrl(userId: string, cvUrl: string, userInfo?: any): Promise<Profile> {
    const profile = await this.findByUserId(userId);

    if (!profile) {
      // Create profile if it doesn't exist
      return this.create({ 
        userId, 
        cvUrl,
        firstName: userInfo?.firstName || '',
        lastName: userInfo?.lastName || '',
        email: userInfo?.email || '',
        phone: userInfo?.phone || '',
        university: userInfo?.university || '',
        linkedin: userInfo?.linkedin || '',
        github: userInfo?.github || '',
        portfolio: userInfo?.portfolio || '',
      });
    }

    return this.profileModel
      .findOneAndUpdate({ userId }, { cvUrl }, { returnDocument: 'after' })
      .exec();
  }
}
