import { Module } from '@nestjs/common';
import { ExtensionService } from './extension.service';
import { ExtensionController } from './extension.controller';
import { ProfileModule } from '../profile/profile.module';
import { ApplicationsModule } from '../applications/applications.module';

@Module({
  imports: [ProfileModule, ApplicationsModule],
  providers: [ExtensionService],
  controllers: [ExtensionController],
})
export class ExtensionModule {}
