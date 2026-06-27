import { Global, Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { CvTextService } from './services/cv-text.service';
import { PlanGuard } from './guards/plan.guard';

@Global()
@Module({
  providers: [EmailService, CvTextService, PlanGuard],
  exports: [EmailService, CvTextService, PlanGuard],
})
export class CommonModule {}
