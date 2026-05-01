import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  phone?: string;

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
