import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument } from '../applications/schemas/application.schema';
import { normalizeUserId, UserId } from '../common/utils/userId.util';

export interface ReminderItem {
  type: 'deadline' | 'follow_up' | 'interview';
  applicationId: string;
  companyName: string;
  position: string;
  message: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

@Injectable()
export class RemindersService {
  constructor(@InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>) {}

  async getReminders(userId: UserId): Promise<ReminderItem[]> {
    const uid = normalizeUserId(userId);
    const apps = await this.applicationModel.find({ userId: uid }).exec();
    const now = new Date();
    const reminders: ReminderItem[] = [];

    for (const app of apps) {
      const id = String((app as any)._id);

      if (app.deadline) {
        const deadline = new Date(app.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 7) {
          reminders.push({
            type: 'deadline',
            applicationId: id,
            companyName: app.companyName,
            position: app.position,
            message: daysUntil === 0 ? 'Deadline is today' : `Deadline in ${daysUntil} day(s)`,
            dueDate: deadline.toISOString(),
            priority: daysUntil <= 1 ? 'high' : 'medium',
          });
        }
      }

      if (app.status === 'applied' && app.dateApplied) {
        const applied = new Date(app.dateApplied);
        const daysSince = Math.floor((now.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= 7 && daysSince <= 14) {
          reminders.push({
            type: 'follow_up',
            applicationId: id,
            companyName: app.companyName,
            position: app.position,
            message: `Follow up — applied ${daysSince} days ago`,
            dueDate: now.toISOString(),
            priority: 'medium',
          });
        }
      }

      if (app.status === 'interview') {
        reminders.push({
          type: 'interview',
          applicationId: id,
          companyName: app.companyName,
          position: app.position,
          message: 'Prepare for your interview',
          dueDate: now.toISOString(),
          priority: 'high',
        });
      }
    }

    return reminders.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    });
  }

  async getCvAnalytics(userId: UserId) {
    const uid = normalizeUserId(userId);
    const apps = await this.applicationModel.find({ userId: uid, cvUsed: { $exists: true, $ne: '' } }).exec();
    const stats: Record<string, { total: number; interviews: number; accepted: number }> = {};

    for (const app of apps) {
      const cv = app.cvUsed || 'unknown';
      if (!stats[cv]) stats[cv] = { total: 0, interviews: 0, accepted: 0 };
      stats[cv].total++;
      if (app.status === 'interview') stats[cv].interviews++;
      if (app.status === 'accepted') stats[cv].accepted++;
    }

    return Object.entries(stats).map(([cvUsed, s]) => ({
      cvUsed,
      ...s,
      interviewRate: s.total ? Math.round((s.interviews / s.total) * 100) : 0,
      acceptanceRate: s.total ? Math.round((s.accepted / s.total) * 100) : 0,
    }));
  }
}
