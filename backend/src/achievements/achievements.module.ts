import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import {
  Achievement,
  AchievementSchema,
  CareerJournalEntry,
  CareerJournalSchema,
} from './schemas/achievement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Achievement.name, schema: AchievementSchema },
      { name: CareerJournalEntry.name, schema: CareerJournalSchema },
    ]),
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
})
export class AchievementsModule {}
