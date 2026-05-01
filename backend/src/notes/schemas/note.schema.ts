import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NoteDocument = Note & Document;

@Schema({ timestamps: true })
export class Note {
  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  applicationId: string;

  @Prop({ required: true })
  userId: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

// Indexes for better query performance
NoteSchema.index({ applicationId: 1, createdAt: -1 });
NoteSchema.index({ userId: 1 });
