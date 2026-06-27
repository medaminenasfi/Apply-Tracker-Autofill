import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserId } from '../../common/utils/userId.util';

export type AutoApplyCriteriaDocument = AutoApplyCriteria & Document;

@Schema({ timestamps: true })
export class AutoApplyCriteria {
  @Prop({ required: true, type: String })
  userId!: UserId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: false })
  location?: string;

  @Prop({ type: [String], default: [] })
  keywords!: string[];

  @Prop({ default: true })
  active!: boolean;
}

export const AutoApplyCriteriaSchema = SchemaFactory.createForClass(AutoApplyCriteria);

@Schema({ timestamps: true })
export class AutoApplyQueueItem {
  @Prop({ required: true, type: String })
  userId!: UserId;

  @Prop({ required: true })
  companyName!: string;

  @Prop({ required: true })
  position!: string;

  @Prop({ required: true })
  jobUrl!: string;

  @Prop({ default: 'pending_approval' })
  status!: string;

  @Prop({ required: false })
  tailoredCoverLetter?: string;
}

export type AutoApplyQueueDocument = AutoApplyQueueItem & Document;
export const AutoApplyQueueSchema = SchemaFactory.createForClass(AutoApplyQueueItem);
