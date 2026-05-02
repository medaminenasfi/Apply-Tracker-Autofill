import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type FeedbackDocument = Feedback & Document;

export enum FeedbackType {
  BUG = 'BUG',
  IMPROVEMENT = 'IMPROVEMENT',
  GENERAL = 'GENERAL',
}

export enum FeedbackStatus {
  NEW = 'NEW',
  VIEWED = 'VIEWED',
  RESOLVED = 'RESOLVED',
}

@Schema({ timestamps: true })
export class Feedback {
  @Prop({ type: Types.ObjectId, required: true, index: true, ref: User.name })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: FeedbackType, required: true })
  type: FeedbackType;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String })
  attachment?: string;

  @Prop({ type: String })
  adminReply?: string;

  @Prop({ type: String, enum: FeedbackStatus, default: FeedbackStatus.NEW, index: true })
  status: FeedbackStatus;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Index for efficient queries
FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1, createdAt: -1 });
