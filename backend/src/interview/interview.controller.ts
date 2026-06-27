import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { InterviewService } from './interview.service';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('interview')
@UseGuards(AuthGuard('jwt'))
export class InterviewController {
  constructor(private interviewService: InterviewService) {}

  @Get('sessions')
  list(@GetUser() user: any) {
    return this.interviewService.listSessions(normalizeUserId(user._id));
  }

  @Post('sessions')
  create(@GetUser() user: any, @Body() body: { jobTitle: string; jobDescription?: string; applicationId?: string }) {
    return this.interviewService.createSession(normalizeUserId(user._id), body);
  }

  @Post('sessions/:id/answer')
  answer(
    @GetUser() user: any,
    @Param('id') id: string,
    @Body() body: { questionIndex: number; answer: string },
  ) {
    return this.interviewService.submitAnswer(id, normalizeUserId(user._id), body.questionIndex, body.answer);
  }
}
