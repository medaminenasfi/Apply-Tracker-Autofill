import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { CreateApplicationDto } from './dto/create-application.dto';
import { NotesService } from '../notes/notes.service';
import { normalizeUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    private notesService: NotesService,
  ) {}

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
    const { note, ...fields } = applicationData;

    let dateApplied = fields.dateApplied;
    if (dateApplied?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const now = new Date();
      const [year, month, day] = dateApplied.split('-').map(Number);
      dateApplied = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
    }

    let deadline: string | Date | undefined = fields.deadline;
    if (deadline?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      deadline = new Date(`${deadline}T23:59:59.000Z`);
    }

    const application = new this.applicationModel({
      ...fields,
      dateApplied,
      deadline,
      source: fields.source || 'manual',
      userId: userIdString,
    });
    const result = await application.save();

    if (note?.trim()) {
      await this.notesService.create(String((result as any)._id), userIdString, note.trim());
    }

    return result;
  }

  async update(id: string, userId: UserId, updateData: any): Promise<Application | null> {
    const userIdString = normalizeUserId(userId);
    const application = await this.findByIdAndUserId(id, userIdString);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const payload = { ...updateData };
    if (payload.dateApplied?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const now = new Date();
      const [year, month, day] = payload.dateApplied.split('-').map(Number);
      payload.dateApplied = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
    }
    if (payload.deadline?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      payload.deadline = new Date(`${payload.deadline}T23:59:59.000Z`);
    }
    if (payload.deadline === '') {
      payload.deadline = null;
    }

    return this.applicationModel
      .findOneAndUpdate({ _id: id, userId: userIdString }, { $set: payload }, { returnDocument: 'after' })
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
