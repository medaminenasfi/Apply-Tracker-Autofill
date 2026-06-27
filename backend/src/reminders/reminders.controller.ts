import { Controller, Get, Post, Headers, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { RemindersService } from './reminders.service';
import { RemindersCronService } from './reminders-cron.service';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('reminders')
export class RemindersController {
  constructor(
    private remindersService: RemindersService,
    private remindersCronService: RemindersCronService,
    private configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async list(@GetUser() user: any) {
    return this.remindersService.getReminders(normalizeUserId(user._id));
  }

  @Get('cv-analytics')
  @UseGuards(AuthGuard('jwt'))
  async cvAnalytics(@GetUser() user: any) {
    return this.remindersService.getCvAnalytics(normalizeUserId(user._id));
  }

  /** Manual trigger for ops / staging (set CRON_SECRET in .env) */
  @Post('send-emails')
  async triggerEmails(@Headers('x-cron-secret') secret: string) {
    const expected = this.configService.get<string>('CRON_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    await this.remindersCronService.sendDailyReminderEmails();
    return { message: 'Reminder emails job executed' };
  }
}
