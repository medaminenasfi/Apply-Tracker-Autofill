import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ProfilePublicController } from './profile-public.controller';
import { Profile, ProfileSchema } from './schemas/profile.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]), UsersModule],
  providers: [ProfileService],
  controllers: [ProfileController, ProfilePublicController],
  exports: [ProfileService],
})
export class ProfileModule {}
