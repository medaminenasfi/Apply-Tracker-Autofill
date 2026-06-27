import { Module } from '@nestjs/common';
import { ExtensionService } from './extension.service';
import { ExtensionController } from './extension.controller';
import { ProfileModule } from '../profile/profile.module';
import { ApplicationsModule } from '../applications/applications.module';
import { AiModule } from '../ai/ai.module';
import { PlanGuard } from '../common/guards/plan.guard';

@Module({
  imports: [ProfileModule, ApplicationsModule, AiModule],
  providers: [ExtensionService, PlanGuard],
  controllers: [ExtensionController],
})
export class ExtensionModule {}
