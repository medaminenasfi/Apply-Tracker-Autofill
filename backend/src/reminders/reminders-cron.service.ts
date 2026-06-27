import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RemindersService } from './reminders.service';
import { EmailService } from '../common/services/email.service';
import { normalizeUserId } from '../common/utils/userId.util';

@Injectable()
export class RemindersCronService {
  private readonly logger = new Logger(RemindersCronService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private remindersService: RemindersService,
    private emailService: EmailService,
  ) {}

  /** Daily at 09:00 server time */
  @Cron('0 9 * * *')
  async sendDailyReminderEmails() {
    if (!this.emailService.isConfigured()) {
      this.logger.debug('Email not configured — skipping reminder cron');
      return;
    }

    const users = await this.userModel
      .find({ role: 'user', emailRemindersEnabled: { $ne: false } })
      .exec();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of users) {
      try {
        if (user.lastReminderEmailAt && user.lastReminderEmailAt >= today) {
          continue;
        }

        const userId = normalizeUserId(String(user._id));
        const reminders = await this.remindersService.getReminders(userId);
        if (!reminders.length) continue;

        const sent = await this.emailService.sendReminderDigest(user.email, reminders);
        if (sent) {
          await this.userModel.findByIdAndUpdate(user._id, {
            $set: { lastReminderEmailAt: new Date() },
          });
          this.logger.log(`Reminder email sent to ${user.email}`);
        }
      } catch (error) {
        this.logger.warn(`Failed reminder email for ${user.email}: ${error}`);
      }
    }
  }
}
