import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { Profile, ProfileSchema } from './schemas/profile.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }])],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
