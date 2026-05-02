import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserId } from '../../common/utils/userId.util';

export type NoteDocument = Note & Document;

@Schema({ timestamps: true })
export class Note {
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
  text!: string;

  @Prop({ required: true })
  applicationId!: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);

// Pre-save hook to auto-normalize userId to string
NoteSchema.pre('save', function (this: any, next: any) {
  if (this.userId && typeof this.userId !== 'string') {
    console.log('[NOTE_SCHEMA] Auto-normalizing userId to string:', this.userId);
    this.userId = String(this.userId);
  }
  next();
});

// Indexes for better query performance
NoteSchema.index({ applicationId: 1, createdAt: -1 });
NoteSchema.index({ userId: 1 });
