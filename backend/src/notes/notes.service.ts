import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  async create(applicationId: string, userId: string, text: string): Promise<Note> {
    console.log('Creating note for app:', applicationId);
    const note = new this.noteModel({
      text,
      applicationId,
      userId,
    });
    const saved = await note.save();
    console.log('Note created:', saved._id);
    return saved;
  }

  async findByApplication(applicationId: string, userId: string): Promise<Note[]> {
    console.log('Fetching notes for app:', applicationId);
    const notes = await this.noteModel
      .find({ applicationId, userId })
      .sort({ createdAt: -1 })
      .exec();
    console.log('Fetched notes count:', notes.length);
    return notes;
  }

  async findById(noteId: string, userId: string): Promise<Note | null> {
    const note = await this.noteModel.findById(noteId).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    // Convert both to string for comparison (userId from JWT might be ObjectId)
    const noteUserIdStr = note.userId.toString();
    const requestUserIdStr = userId.toString();
    console.log('Checking access - note.userId:', noteUserIdStr, 'request userId:', requestUserIdStr);
    if (noteUserIdStr !== requestUserIdStr) {
      throw new ForbiddenException('You do not have access to this note');
    }
    return note;
  }

  async update(noteId: string, userId: string, text: string): Promise<Note | null> {
    const note = await this.findById(noteId, userId);
    return this.noteModel
      .findByIdAndUpdate(
        noteId,
        { text },
        { returnDocument: 'after' }
      )
      .exec();
  }

  async delete(noteId: string, userId: string): Promise<Note | null> {
    const note = await this.findById(noteId, userId);
    return this.noteModel.findByIdAndDelete(noteId).exec();
  }

  async migrateFromApplication(applicationId: string, userId: string, notes: any[]): Promise<void> {
    console.log('Migrating notes for app:', applicationId, 'count:', notes.length);
    for (const oldNote of notes) {
      await this.noteModel.create({
        text: oldNote.text,
        applicationId,
        userId,
      });
    }
    console.log('Migration complete for app:', applicationId);
  }
}
