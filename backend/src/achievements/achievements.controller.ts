import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AchievementsService } from './achievements.service';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('achievements')
@UseGuards(AuthGuard('jwt'))
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  @Get()
  list(@GetUser() user: any) {
    return this.achievementsService.listAchievements(normalizeUserId(user._id));
  }

  @Post()
  addManual(@GetUser() user: any, @Body() body: { title: string; description?: string; url?: string }) {
    return this.achievementsService.addManual(normalizeUserId(user._id), body);
  }

  @Post('harvest/github')
  harvestGitHub(@GetUser() user: any, @Body() body: { username: string }) {
    return this.achievementsService.harvestGitHub(normalizeUserId(user._id), body.username);
  }

  @Get('journal')
  listJournal(@GetUser() user: any) {
    return this.achievementsService.listJournal(normalizeUserId(user._id));
  }

  @Post('journal')
  addJournal(@GetUser() user: any, @Body() body: { content: string; tags?: string[] }) {
    return this.achievementsService.addJournalEntry(normalizeUserId(user._id), body.content, body.tags);
  }
}
