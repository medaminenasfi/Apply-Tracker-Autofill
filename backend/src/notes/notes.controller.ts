import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { NotesService } from './notes.service';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Post()
  async createNote(
    @GetUser() user: any,
    @Body() body: { applicationId: string; text: string },
  ) {
    return this.notesService.create(body.applicationId, user._id, body.text);
  }

  @Get()
  async getNotesByApplication(
    @GetUser() user: any,
    @Query('applicationId') applicationId: string,
  ) {
    if (!applicationId) {
      return [];
    }
    return this.notesService.findByApplication(applicationId, user._id);
  }

  @Patch(':noteId')
  async updateNote(
    @GetUser() user: any,
    @Param('noteId') noteId: string,
    @Body() body: { text: string },
  ) {
    console.log('Update note - noteId:', noteId, 'userId:', user._id);
    return this.notesService.update(noteId, user._id, body.text);
  }

  @Delete(':noteId')
  async deleteNote(
    @GetUser() user: any,
    @Param('noteId') noteId: string,
  ) {
    console.log('Delete note - noteId:', noteId, 'userId:', user._id);
    return this.notesService.delete(noteId, user._id);
  }
}
