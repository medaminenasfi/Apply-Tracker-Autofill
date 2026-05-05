import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { CreateApplicationDto } from './dto';
import { normalizeUserId, validateUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class ApplicationsService {
  constructor(@InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>) {}

  async findAll(): Promise<Application[]> {
    const applications = await this.applicationModel.find().exec();
    
    // Manually populate user data for each application
    const populatedApplications = await Promise.all(
      applications.map(async (app) => {
        try {
          const User = this.applicationModel.db.model('User');
          const user = await User.findById(app.userId).select('email firstName lastName').exec();
          return {
            ...(app as any).toObject(),
            userId: user ? {
              _id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName
            } : app.userId
          };
        } catch (error) {
          return app;
        }
      })
    );

    return populatedApplications;
  }

  async findByUserId(userId: UserId): Promise<Application[]> {
    const userIdString = normalizeUserId(userId);
    console.log('[BACKEND] findByUserId called with userId:', userIdString, 'type:', typeof userIdString);

    const applications = await this.applicationModel.find({ userId: userIdString }).exec();
    console.log('[BACKEND] findByUserId returning count:', applications.length);
    return applications;
  }

  async findById(id: string): Promise<Application | null> {
    return this.applicationModel.findById(id).exec();
  }

  async findByIdAndUserId(id: string, userId: UserId): Promise<Application | null> {
    const userIdString = normalizeUserId(userId);
    return this.applicationModel.findOne({ _id: id, userId: userIdString }).exec();
  }

  async create(applicationData: CreateApplicationDto, userId: UserId): Promise<Application> {
    const userIdString = normalizeUserId(userId);
    console.log('[APPLICATION_CREATE] userId:', userIdString, 'type:', typeof userIdString);
    console.log('Applications create called with:', applicationData);
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
    } else {
      // Use current UTC time if no date provided
      dateApplied = new Date().toISOString();
      console.log('No date provided, using current UTC time:', dateApplied);
    }

    const application = new this.applicationModel({
      ...applicationData,
      dateApplied,
      userId: userIdString,
    });
    const result = await application.save();
    console.log('[APPLICATION_CREATE_SUCCESS] id:', (result as any)._id, 'userId:', result.userId);
    console.log('Application created with dateApplied:', result.dateApplied);
    return result;
  }

  async update(id: string, userId: UserId, updateData: any): Promise<Application | null> {
    const userIdString = normalizeUserId(userId);
    const application = await this.findByIdAndUserId(id, userIdString);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.applicationModel
      .findOneAndUpdate({ _id: id, userId: userIdString }, { $set: updateData }, { returnDocument: 'after' })
      .exec();
  }

  async updateStatus(id: string, userId: UserId, status: string): Promise<Application | null> {
    const userIdString = normalizeUserId(userId);
    const application = await this.findByIdAndUserId(id, userIdString);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.applicationModel
      .findOneAndUpdate({ _id: id, userId: userIdString }, { $set: { status } }, { returnDocument: 'after' })
      .exec();
  }

  async delete(id: string, userId: UserId): Promise<Application | null> {
    const userIdString = normalizeUserId(userId);
    const application = await this.findByIdAndUserId(id, userIdString);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.applicationModel.findOneAndDelete({ _id: id, userId: userIdString }).exec();
  }

  async deleteByAdmin(id: string): Promise<Application | null> {
    return this.applicationModel.findByIdAndDelete(id).exec();
  }

  async getStatsByStatus(): Promise<any> {
    return this.applicationModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getTotalCount(): Promise<number> {
    return this.applicationModel.countDocuments().exec();
  }
}
