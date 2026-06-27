import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UsersService } from './users.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { normalizeUserId } from '../common/utils/userId.util';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('notification-preferences')
  async getNotificationPreferences(@GetUser() user: any) {
    const dbUser = await this.usersService.findById(normalizeUserId(user._id));
    return {
      emailRemindersEnabled: dbUser?.emailRemindersEnabled ?? true,
      inAppRemindersEnabled: dbUser?.inAppRemindersEnabled ?? true,
    };
  }

  @Patch('notification-preferences')
  async updateNotificationPreferences(
    @GetUser() user: any,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    const userId = normalizeUserId(user._id);
    const updated = await this.usersService.updateUser(userId, dto);
    return {
      emailRemindersEnabled: updated?.emailRemindersEnabled ?? true,
      inAppRemindersEnabled: updated?.inAppRemindersEnabled ?? true,
    };
  }
}
