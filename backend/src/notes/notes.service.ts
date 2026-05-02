import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';
import { normalizeUserId, validateUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class NotesService {
  constructor(@InjectModel(Note.name) private noteModel: Model<NoteDocument>) {}

  async create(applicationId: string, userId: UserId, text: string): Promise<Note> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    console.log('[NOTE_CREATE] userId:', userIdString, 'type:', typeof userIdString);
    const note = new this.noteModel({
      text,
      applicationId,
      userId: userIdString,
    });
    const saved = await note.save();
    console.log('Note created:', saved._id);
    return saved;
  }

  async findByApplication(applicationId: string, userId: UserId): Promise<Note[]> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    console.log('[NOTE_FIND_BY_APP] userId:', userIdString, 'type:', typeof userIdString);
    const notes = await this.noteModel
      .find({ applicationId, userId: userIdString })
      .sort({ createdAt: -1 })
      .exec();
    console.log('Fetched notes count:', notes.length);
    return notes;
  }

  async findById(noteId: string, userId: UserId): Promise<Note | null> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    const note = await this.noteModel.findById(noteId).exec();
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    console.log('[NOTE_FIND_BY_ID] note.userId:', note.userId, 'request userId:', userIdString);
    if (note.userId !== userIdString) {
      throw new ForbiddenException('You do not have access to this note');
    }
    return note;
  }

  async update(noteId: string, userId: UserId, text: string): Promise<Note | null> {
    const note = await this.findById(noteId, userId);
    return this.noteModel
      .findByIdAndUpdate(
        noteId,
        { text },
        { returnDocument: 'after' }
      )
      .exec();
  }

  async delete(noteId: string, userId: UserId): Promise<Note | null> {
    const note = await this.findById(noteId, userId);
    return this.noteModel.findByIdAndDelete(noteId).exec();
  }

  async migrateFromApplication(applicationId: string, userId: UserId, notes: any[]): Promise<void> {
    validateUserId(userId);
    const userIdString = normalizeUserId(userId);
    console.log('Migrating notes for app:', applicationId, 'count:', notes.length);
    for (const oldNote of notes) {
      await this.noteModel.create({
        text: oldNote.text,
        applicationId,
        userId: userIdString,
      });
    }
    console.log('Migration complete for app:', applicationId);
  }
}
