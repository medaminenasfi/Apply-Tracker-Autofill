import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserId } from '../../common/utils/userId.util';

export type VaultAnswerDocument = VaultAnswer & Document;

@Schema({ timestamps: true })
export class VaultAnswer {
  @Prop({ required: true, type: String })
  userId!: UserId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ default: false })
  favorite!: boolean;

  @Prop({ required: false })
  roleType?: string;
}

export const VaultAnswerSchema = SchemaFactory.createForClass(VaultAnswer);
VaultAnswerSchema.index({ userId: 1, updatedAt: -1 });
