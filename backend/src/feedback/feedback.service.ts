import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Feedback, FeedbackDocument, FeedbackStatus } from './schemas/feedback.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  async create(userId: Types.ObjectId, createFeedbackDto: CreateFeedbackDto) {
    const feedback = new this.feedbackModel({
      userId,
      ...createFeedbackDto,
      status: FeedbackStatus.NEW,
    });
    return feedback.save();
  }

  async findUserFeedback(userId: Types.ObjectId) {
    return this.feedbackModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId?: Types.ObjectId) {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // If userId is provided, check ownership
    if (userId && !feedback.userId.equals(userId)) {
      throw new ForbiddenException('You do not have access to this feedback');
    }

    // Manually populate user data
    try {
      const User = this.feedbackModel.db.model('User');
      const user = await User.findById(feedback.userId).select('firstName lastName email').exec();
      return {
        ...(feedback as any).toObject(),
        user: user ? (user as any).toObject() : null,
      };
    } catch (error) {
      return (feedback as any).toObject();
    }
  }

  async findAll(status?: FeedbackStatus, type?: string) {
    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const feedback = await this.feedbackModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    // Manually populate user data
    const populatedFeedback = await Promise.all(
      feedback.map(async (item) => {
        try {
          const User = this.feedbackModel.db.model('User');
          const user = await User.findById(item.userId).select('firstName lastName email').exec();
          return {
            ...(item as any).toObject(),
            user: user ? (user as any).toObject() : null,
          };
        } catch (error) {
          return {
            ...(item as any).toObject(),
            user: null,
          };
        }
      })
    );

    return populatedFeedback;
  }

  async update(id: string, updateFeedbackDto: UpdateFeedbackDto) {
    const feedback = await this.feedbackModel.findById(id);
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    Object.assign(feedback, updateFeedbackDto);
    return feedback.save();
  }
}
