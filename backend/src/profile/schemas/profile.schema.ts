import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserId } from '../../common/utils/userId.util';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop({
    required: true,
    unique: true,
    type: String,
    validate: {
      validator: (v: unknown) => typeof v === 'string',
      message: 'userId must be a string'
    }
  })
  userId!: UserId;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false, default: '+216' })
  countryCode?: string;

  @Prop({ required: false })
  university?: string;

  @Prop({ required: false })
  linkedin?: string;

  @Prop({ required: false })
  portfolio?: string;

  @Prop({ required: false })
  profilePictureUrl?: string;

  @Prop({ required: false })
  cvUrl?: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);

// Pre-save hook to auto-normalize userId to string
ProfileSchema.pre('save', async function (this: any) {
  if (this.userId && typeof this.userId !== 'string') {
    console.log('[PROFILE_SCHEMA] Auto-normalizing userId to string:', this.userId);
    this.userId = String(this.userId);
  }
});
