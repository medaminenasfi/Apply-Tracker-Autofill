import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: false })
  googleId?: string;

  @Prop({ required: true, enum: ['local', 'google'], default: 'local' })
  authProvider!: string;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role!: string;

  @Prop({ required: false })
  resetToken?: string;

  @Prop({ required: false })
  resetTokenExpires?: Date;

  @Prop({ required: true, enum: ['free', 'pro', 'advanced'], default: 'free' })
  plan!: string;

  @Prop({ required: false })
  stripeCustomerId?: string;

  @Prop({ required: false, enum: ['none', 'active', 'cancelled', 'past_due'], default: 'none' })
  subscriptionStatus!: string;

  @Prop({ default: true })
  emailRemindersEnabled!: boolean;

  @Prop({ default: true })
  inAppRemindersEnabled!: boolean;

  @Prop({ required: false })
  lastReminderEmailAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Exclude password from JSON responses
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.resetToken;
    return ret;
  },
});
