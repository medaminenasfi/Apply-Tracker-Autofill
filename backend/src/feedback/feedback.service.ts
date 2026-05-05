import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feedback, FeedbackDocument, FeedbackStatus } from './schemas/feedback.schema';
import { CreateFeedbackDto, UpdateFeedbackDto } from './dto';
import { normalizeUserId, validateUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name) private feedbackModel: Model<FeedbackDocument>,
  ) {}

  async create(userId: UserId, createFeedbackDto: CreateFeedbackDto) {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    console.log('[FEEDBACK_CREATE] userId:', userIdString, 'type:', typeof userIdString);
    const feedback = new this.feedbackModel({
      userId: userIdString,
      ...createFeedbackDto,
      status: FeedbackStatus.NEW,
    });
    const result = await feedback.save();
    console.log('[FEEDBACK_CREATE_SUCCESS] id:', (result as any)._id, 'userId:', result.userId);
    return result;
  }

  async findUserFeedback(userId: UserId) {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    console.log('[FEEDBACK_FIND_BY_USER] userId:', userIdString, 'type:', typeof userIdString);

    // Debug: Check ALL feedback to see what userIds exist
    const allFeedback = await this.feedbackModel.find().exec();
    console.log('[FEEDBACK] ALL feedback in DB:', allFeedback.map((fb: any) => ({
      _id: fb._id,
      userId: fb.userId,
      userIdType: typeof fb.userId,
      userIdLength: fb.userId ? fb.userId.length : 0,
      message: fb.message
    })));

    // Try multiple query approaches
    const query1 = { userId: userIdString };
    console.log('[FEEDBACK] Query 1 (exact match):', query1);
    const result1 = await this.feedbackModel.find(query1).exec();
    console.log('[FEEDBACK] Query 1 result count:', result1.length);

    // Try with regex (case-insensitive)
    const query2 = { userId: { $regex: new RegExp(`^${userIdString}$`, 'i') } };
    console.log('[FEEDBACK] Query 2 (regex):', query2);
    const result2 = await this.feedbackModel.find(query2).exec();
    console.log('[FEEDBACK] Query 2 result count:', result2.length);

    const result = result1.length > 0 ? result1 : result2;
    console.log('[FEEDBACK_FIND_BY_USER] returning count:', result.length);
    return result;
  }

  async findOne(id: string, userId?: UserId) {
    const feedback = await this.feedbackModel.findById(id).exec();
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // If userId is provided, check ownership (userId is now string)
    if (userId) {
      validateUserId(userId);
      const userIdString = normalizeUserId(userId);
      if (feedback.userId !== userIdString) {
        throw new ForbiddenException('You do not have access to this feedback');
      }
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

  async delete(id: string, userId?: UserId) {
    const feedback = await this.feedbackModel.findById(id);
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // If userId is provided, check ownership
    if (userId) {
      validateUserId(userId);
      const userIdString = normalizeUserId(userId);
      if (feedback.userId !== userIdString) {
        throw new ForbiddenException('You do not have permission to delete this feedback');
      }
    }

    await this.feedbackModel.deleteOne({ _id: id });
    return { message: 'Feedback deleted successfully' };
  }

  async getTotalCount() {
    return this.feedbackModel.countDocuments().exec();
  }
}
