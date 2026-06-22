import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserId } from '../../common/utils/userId.util';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
  @Prop({
    required: true,
    type: String,
    validate: {
      validator: (v: unknown) => typeof v === 'string',
      message: 'userId must be a string'
    }
  })
  userId!: UserId;

  @Prop({ required: true })
  companyName!: string;

  @Prop({ required: true })
  position!: string;

  @Prop({ required: true })
  jobUrl!: string;

  @Prop({ required: true, enum: ['applied', 'interview', 'accepted', 'rejected'], default: 'applied' })
  status!: string;

  @Prop({ required: true })
  dateApplied!: Date;

  @Prop({ required: false })
  deadline?: Date;

  @Prop({ required: false, enum: ['manual', 'extension'], default: 'manual' })
  source!: string;

  @Prop({ required: false })
  cvUsed?: string;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);

// Pre-save hook to auto-normalize userId to string
ApplicationSchema.pre('save', async function (this: any) {
  if (this.userId && typeof this.userId !== 'string') {
    console.log('[APPLICATION_SCHEMA] Auto-normalizing userId to string:', this.userId);
    this.userId = String(this.userId);
  }
});
