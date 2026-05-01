import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ required: false })
  googleId?: string;

  @Prop({ required: true, enum: ['local', 'google'], default: 'local' })
  authProvider: string;

  @Prop({ required: true, enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ required: false })
  resetToken?: string;

  @Prop({ required: false })
  resetTokenExpires?: Date;
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
