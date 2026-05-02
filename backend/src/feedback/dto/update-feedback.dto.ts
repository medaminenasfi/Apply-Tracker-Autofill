import { FeedbackStatus } from '../schemas/feedback.schema';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateFeedbackDto {
  @IsEnum(FeedbackStatus)
  @IsOptional()
  status?: FeedbackStatus;

  @IsString()
  @IsOptional()
  adminReply?: string;
}
