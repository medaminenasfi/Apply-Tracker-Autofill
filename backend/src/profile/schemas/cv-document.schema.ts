import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: true })
export class CvDocument {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  filename!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true, default: () => new Date() })
  uploadedAt!: Date;
}

export const CvDocumentSchema = SchemaFactory.createForClass(CvDocument);
