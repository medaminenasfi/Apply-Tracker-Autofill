import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { NotesService } from './notes.service';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('notes')
@UseGuards(AuthGuard('jwt'))
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post()
  async createNote(
    @GetUser() user: any,
    @Body() body: { applicationId: string; text: string },
  ) {
    const userIdString = normalizeUserId(user._id);
    return this.notesService.create(body.applicationId, userIdString, body.text);
  }

  @Get()
  async getNotesByApplication(
    @GetUser() user: any,
    @Query('applicationId') applicationId: string,
  ) {
    if (!applicationId) {
      return [];
    }
    const userIdString = normalizeUserId(user._id);
    return this.notesService.findByApplication(applicationId, userIdString);
  }

  @Patch(':noteId')
  async updateNote(
    @GetUser() user: any,
    @Param('noteId') noteId: string,
    @Body() body: { text: string },
  ) {
    const userIdString = normalizeUserId(user._id);
    console.log('Update note - noteId:', noteId, 'userId:', userIdString);
    return this.notesService.update(noteId, userIdString, body.text);
  }

  @Delete(':noteId')
  async deleteNote(
    @GetUser() user: any,
    @Param('noteId') noteId: string,
  ) {
    const userIdString = normalizeUserId(user._id);
    console.log('Delete note - noteId:', noteId, 'userId:', userIdString);
    return this.notesService.delete(noteId, userIdString);
  }
}
