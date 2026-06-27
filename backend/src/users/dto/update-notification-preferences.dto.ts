import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsBoolean()
  @IsOptional()
  emailRemindersEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  inAppRemindersEnabled?: boolean;
}
