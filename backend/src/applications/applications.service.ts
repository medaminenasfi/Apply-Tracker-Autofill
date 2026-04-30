import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';

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

  async create(applicationData: any): Promise<Application> {
    const createdApplication = new this.applicationModel(applicationData);
    return createdApplication.save();
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
