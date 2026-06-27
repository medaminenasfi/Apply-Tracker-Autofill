import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { RemindersCronService } from './reminders-cron.service';
import { Application, ApplicationSchema } from '../applications/schemas/application.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RemindersController],
  providers: [RemindersService, RemindersCronService],
  exports: [RemindersService],
})
export class RemindersModule {}
