import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { ApplicationsModule } from '../applications/applications.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [UsersModule, ApplicationsModule, FeedbackModule],
  providers: [AdminService, RolesGuard],
  controllers: [AdminController],
})
export class AdminModule {}
