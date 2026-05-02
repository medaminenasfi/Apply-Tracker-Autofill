import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(@InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>) {}

  async findAll(): Promise<Application[]> {
    return this.applicationModel.find().exec();
  }

  async findByUserId(userId: string): Promise<Application[]> {
    return this.applicationModel.find({ userId }).exec();
  }

  async findById(id: string): Promise<Application | null> {
    return this.applicationModel.findById(id).exec();
  }

  async findByIdAndUserId(id: string, userId: string): Promise<Application | null> {
    return this.applicationModel.findOne({ _id: id, userId }).exec();
  }

  async create(applicationData: CreateApplicationDto, userId: string): Promise<Application> {
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
      userId,
    });
    const result = await application.save();
    console.log('Application created with dateApplied:', result.dateApplied);
    return result;
  }

  async update(id: string, userId: string, updateData: any): Promise<Application | null> {
    const application = await this.findByIdAndUserId(id, userId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.applicationModel
      .findOneAndUpdate({ _id: id, userId }, { $set: updateData }, { returnDocument: 'after' })
      .exec();
  }

  async updateStatus(id: string, userId: string, status: string): Promise<Application | null> {
    const application = await this.findByIdAndUserId(id, userId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.applicationModel
      .findOneAndUpdate({ _id: id, userId }, { $set: { status } }, { returnDocument: 'after' })
      .exec();
  }

  async delete(id: string, userId: string): Promise<Application | null> {
    const application = await this.findByIdAndUserId(id, userId);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.applicationModel.findOneAndDelete({ _id: id, userId }).exec();
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
