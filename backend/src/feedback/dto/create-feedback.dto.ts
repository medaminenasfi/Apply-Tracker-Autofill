import { FeedbackType } from '../schemas/feedback.schema';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFeedbackDto {
  @IsEnum(FeedbackType)
  type: FeedbackType;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  attachment?: string;
}
