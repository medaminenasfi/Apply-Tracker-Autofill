import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserId } from '../../common/utils/userId.util';

export type AchievementDocument = Achievement & Document;

@Schema({ timestamps: true })
export class Achievement {
  @Prop({ required: true, type: String })
  userId!: UserId;

  @Prop({ required: true, enum: ['github', 'jira', 'manual'] })
  source!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  url?: string;

  @Prop({ required: false })
  occurredAt?: Date;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

@Schema({ timestamps: true })
export class CareerJournalEntry {
  @Prop({ required: true, type: String })
  userId!: UserId;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];
}

export type CareerJournalDocument = CareerJournalEntry & Document;
export const CareerJournalSchema = SchemaFactory.createForClass(CareerJournalEntry);
