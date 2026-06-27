import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserId } from '../../common/utils/userId.util';

export type InterviewSessionDocument = InterviewSession & Document;

@Schema({ timestamps: true })
export class InterviewSession {
  @Prop({ required: true, type: String })
  userId!: UserId;

  @Prop({ required: false })
  applicationId?: string;

  @Prop({ required: true })
  jobTitle!: string;

  @Prop({ type: [String], default: [] })
  questions!: string[];

  @Prop({ type: [{ question: String, answer: String, feedback: String }], default: [] })
  responses!: Array<{ question: string; answer: string; feedback: string }>;

  @Prop({ default: 'in_progress' })
  status!: string;
}

export const InterviewSessionSchema = SchemaFactory.createForClass(InterviewSession);
