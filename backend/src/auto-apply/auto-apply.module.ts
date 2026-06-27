import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AutoApplyController } from './auto-apply.controller';
import { AutoApplyService } from './auto-apply.service';
import {
  AutoApplyCriteria,
  AutoApplyCriteriaSchema,
  AutoApplyQueueItem,
  AutoApplyQueueSchema,
} from './schemas/auto-apply.schema';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AutoApplyCriteria.name, schema: AutoApplyCriteriaSchema },
      { name: AutoApplyQueueItem.name, schema: AutoApplyQueueSchema },
    ]),
    ApplicationsModule,
  ],
  controllers: [AutoApplyController],
  providers: [AutoApplyService],
})
export class AutoApplyModule {}
