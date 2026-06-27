import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: ['university', 'enterprise'] })
  type!: string;

  @Prop({ type: [String], default: [] })
  memberUserIds!: string[];

  @Prop({ type: [String], default: [] })
  counselorUserIds!: string[];

  @Prop({ default: 100 })
  seatLimit!: number;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
