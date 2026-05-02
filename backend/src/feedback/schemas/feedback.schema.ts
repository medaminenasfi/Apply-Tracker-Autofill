import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserId } from '../../common/utils/userId.util';

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

@Schema({ timestamps: true, collection: 'feedbacks' })
export class Feedback {
  @Prop({
    type: String,
    required: true,
    index: true
  })
  userId!: UserId;

  @Prop({ type: String, enum: FeedbackType, required: true })
  type!: FeedbackType;

  @Prop({ type: String, required: true })
  message!: string;

  @Prop({ type: String })
  attachment?: string;

  @Prop({ type: String })
  adminReply?: string;

  @Prop({ type: String, enum: FeedbackStatus, default: FeedbackStatus.NEW, index: true })
  status!: FeedbackStatus;

  @Prop({ type: Date })
  createdAt!: Date;

  @Prop({ type: Date })
  updatedAt!: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Pre-save hook to auto-normalize userId to string
FeedbackSchema.pre('save', function (this: any) {
  if (this.userId && typeof this.userId !== 'string') {
    console.log('[FEEDBACK_SCHEMA] Auto-normalizing userId to string:', this.userId);
    this.userId = String(this.userId);
  }
});

// Index for efficient queries
FeedbackSchema.index({ userId: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1, createdAt: -1 });
