import { IsString, IsOptional, IsDateString } from 'class-validator';

export class SaveApplicationDto {
  @IsString()
  companyName: string;

  @IsString()
  position: string;

  @IsString()
  @IsOptional()
  jobUrl?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  @IsOptional()
  dateApplied?: string;
}
