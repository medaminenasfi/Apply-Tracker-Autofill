import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AutoApplyCriteria,
  AutoApplyCriteriaDocument,
  AutoApplyQueueItem,
  AutoApplyQueueDocument,
} from './schemas/auto-apply.schema';
import { ApplicationsService } from '../applications/applications.service';
import { normalizeUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class AutoApplyService {
  constructor(
    @InjectModel(AutoApplyCriteria.name) private criteriaModel: Model<AutoApplyCriteriaDocument>,
    @InjectModel(AutoApplyQueueItem.name) private queueModel: Model<AutoApplyQueueDocument>,
    private applicationsService: ApplicationsService,
  ) {}

  async getCriteria(userId: UserId) {
    return this.criteriaModel.find({ userId: normalizeUserId(userId) }).exec();
  }

  async saveCriteria(userId: UserId, data: { title: string; location?: string; keywords?: string[] }) {
    const uid = normalizeUserId(userId);
    const doc = new this.criteriaModel({ ...data, userId: uid, keywords: data.keywords || [] });
    return doc.save();
  }

  async getQueue(userId: UserId) {
    return this.queueModel.find({ userId: normalizeUserId(userId), status: 'pending_approval' }).exec();
  }

  async addToQueue(userId: UserId, item: { companyName: string; position: string; jobUrl: string; tailoredCoverLetter?: string }) {
    const uid = normalizeUserId(userId);
    const doc = new this.queueModel({ ...item, userId: uid, status: 'pending_approval' });
    return doc.save();
  }

  async approve(userId: UserId, queueId: string) {
    const uid = normalizeUserId(userId);
    const item = await this.queueModel.findOne({ _id: queueId, userId: uid }).exec();
    if (!item) return null;

    const application = await this.applicationsService.create(
      {
        companyName: item.companyName,
        position: item.position,
        jobUrl: item.jobUrl,
        status: 'applied',
        dateApplied: new Date().toISOString().split('T')[0],
        source: 'extension',
        note: item.tailoredCoverLetter || 'Auto-applied via Ghost Mode',
      } as any,
      uid,
    );

    item.status = 'approved';
    await item.save();
    return application;
  }
}
