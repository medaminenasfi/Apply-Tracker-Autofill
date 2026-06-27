import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from './schemas/organization.schema';
import { Application, ApplicationDocument } from '../applications/schemas/application.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class EnterpriseService {
  constructor(
    @InjectModel(Organization.name) private orgModel: Model<OrganizationDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async listOrganizations() {
    return this.orgModel.find().exec();
  }

  async createOrganization(data: { name: string; type: 'university' | 'enterprise'; seatLimit?: number }) {
    const org = new this.orgModel({ ...data, memberUserIds: [], counselorUserIds: [] });
    return org.save();
  }

  async getCounselorDashboard(counselorUserId: string) {
    const orgs = await this.orgModel.find({ counselorUserIds: counselorUserId }).exec();
    if (!orgs.length) return { organizations: [], members: [], stats: {} };

    const memberIds = [...new Set(orgs.flatMap((o) => o.memberUserIds))];
    const members = await this.userModel.find({ _id: { $in: memberIds } }).select('firstName lastName email plan').exec();

    const apps = await this.applicationModel.find({ userId: { $in: memberIds } }).exec();
    const stats = {
      totalApplications: apps.length,
      byStatus: apps.reduce((acc: Record<string, number>, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {}),
      activeMembers: memberIds.length,
    };

    return {
      organizations: orgs,
      members,
      stats,
    };
  }

  async addMember(orgId: string, userId: string) {
    return this.orgModel.findByIdAndUpdate(orgId, { $addToSet: { memberUserIds: userId } }, { returnDocument: 'after' }).exec();
  }
}
