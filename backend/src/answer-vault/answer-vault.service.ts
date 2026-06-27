import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VaultAnswer, VaultAnswerDocument } from './schemas/vault-answer.schema';
import { CreateVaultAnswerDto, UpdateVaultAnswerDto } from './dto/vault-answer.dto';
import { normalizeUserId, UserId } from '../common/utils/userId.util';

@Injectable()
export class AnswerVaultService {
  constructor(@InjectModel(VaultAnswer.name) private vaultModel: Model<VaultAnswerDocument>) {}

  async findAll(userId: UserId) {
    const uid = normalizeUserId(userId);
    return this.vaultModel.find({ userId: uid }).sort({ updatedAt: -1 }).exec();
  }

  async create(userId: UserId, dto: CreateVaultAnswerDto) {
    const uid = normalizeUserId(userId);
    const doc = new this.vaultModel({ ...dto, userId: uid });
    return doc.save();
  }

  async update(id: string, userId: UserId, dto: UpdateVaultAnswerDto) {
    await this.assertOwner(id, userId);
    return this.vaultModel.findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' }).exec();
  }

  async delete(id: string, userId: UserId) {
    await this.assertOwner(id, userId);
    return this.vaultModel.findByIdAndDelete(id).exec();
  }

  async syncReplaceAll(userId: UserId, answers: CreateVaultAnswerDto[]) {
    const uid = normalizeUserId(userId);
    await this.vaultModel.deleteMany({ userId: uid }).exec();
    if (!answers.length) return [];
    const docs = answers.map((a) => ({ ...a, userId: uid }));
    return this.vaultModel.insertMany(docs);
  }

  private async assertOwner(id: string, userId: UserId) {
    const uid = normalizeUserId(userId);
    const doc = await this.vaultModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Answer not found');
    if (doc.userId !== uid) throw new ForbiddenException('Access denied');
    return doc;
  }
}
