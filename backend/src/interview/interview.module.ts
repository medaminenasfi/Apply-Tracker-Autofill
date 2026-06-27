import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { InterviewSession, InterviewSessionSchema } from './schemas/interview.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: InterviewSession.name, schema: InterviewSessionSchema }])],
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewModule {}
