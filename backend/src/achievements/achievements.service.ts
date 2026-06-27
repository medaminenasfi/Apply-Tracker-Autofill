import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Achievement,
  AchievementDocument,
  CareerJournalEntry,
  CareerJournalDocument,
} from './schemas/achievement.schema';
import { normalizeUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectModel(Achievement.name) private achievementModel: Model<AchievementDocument>,
    @InjectModel(CareerJournalEntry.name) private journalModel: Model<CareerJournalDocument>,
  ) {}

  async listAchievements(userId: UserId) {
    return this.achievementModel.find({ userId: normalizeUserId(userId) }).sort({ occurredAt: -1 }).exec();
  }

  async addManual(userId: UserId, data: { title: string; description?: string; url?: string }) {
    const doc = new this.achievementModel({ ...data, userId: normalizeUserId(userId), source: 'manual' });
    return doc.save();
  }

  async harvestGitHub(userId: UserId, username: string) {
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
      const repos = await res.json();
      if (!Array.isArray(repos)) return [];

      const uid = normalizeUserId(userId);
      const created: Achievement[] = [];

      for (const repo of repos.slice(0, 5)) {
        const existing = await this.achievementModel.findOne({ userId: uid, url: repo.html_url }).exec();
        if (existing) continue;

        const doc = await new this.achievementModel({
          userId: uid,
          source: 'github',
          title: `GitHub: ${repo.name}`,
          description: repo.description || `Language: ${repo.language || 'N/A'}`,
          url: repo.html_url,
          occurredAt: new Date(repo.updated_at),
        }).save();
        created.push(doc);
      }
      return created;
    } catch {
      return [];
    }
  }

  async listJournal(userId: UserId) {
    return this.journalModel.find({ userId: normalizeUserId(userId) }).sort({ createdAt: -1 }).exec();
  }

  async addJournalEntry(userId: UserId, content: string, tags?: string[]) {
    const doc = new this.journalModel({ userId: normalizeUserId(userId), content, tags: tags || [] });
    return doc.save();
  }
}
