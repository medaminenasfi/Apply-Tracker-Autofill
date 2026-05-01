import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: false })
  jobUrl?: string;

  @Prop({ required: true, enum: ['applied', 'interview', 'accepted', 'rejected'], default: 'applied' })
  status: string;

  @Prop({ required: false })
  dateApplied?: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
