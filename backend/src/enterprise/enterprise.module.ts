import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { Organization, OrganizationSchema } from './schemas/organization.schema';
import { Application, ApplicationSchema } from '../applications/schemas/application.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [EnterpriseController],
  providers: [EnterpriseService],
})
export class EnterpriseModule {}
