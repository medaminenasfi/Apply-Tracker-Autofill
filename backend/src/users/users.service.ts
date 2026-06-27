import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || 'user',
    });
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ resetToken: token, resetTokenExpires: { $gt: new Date() } }).exec();
  }

  async createGoogleUser(googleUser: any): Promise<User> {
    const createdUser = new this.userModel({
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      email: googleUser.email,
      googleId: googleUser.googleId,
      authProvider: 'google',
    });
    return createdUser.save();
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async getTotalCount(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async delete(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async generateResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userModel.findByIdAndUpdate((user as any)._id, {
      resetToken,
      resetTokenExpires,
    });

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.findByResetToken(token);
    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userModel.findByIdAndUpdate((user as any)._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    });
  }

  async updateUser(userId: string, updateData: any): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, { $set: updateData }, { returnDocument: 'after' }).exec();
  }

  async updateBilling(userId: string, data: { plan?: string; stripeCustomerId?: string; subscriptionStatus?: string }) {
    return this.userModel.findByIdAndUpdate(userId, { $set: data }, { returnDocument: 'after' }).exec();
  }

  async findByStripeCustomerId(customerId: string): Promise<User | null> {
    return this.userModel.findOne({ stripeCustomerId: customerId }).exec();
  }

  async getPlan(userId: string): Promise<string> {
    const user = await this.findById(userId);
    return user?.plan || 'free';
  }
}
