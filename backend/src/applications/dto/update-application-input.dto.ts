import { IsString, IsUrl, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class UpdateApplicationDto {
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsUrl()
  @IsOptional()
  jobUrl?: string;

  @IsEnum(['applied', 'interview', 'accepted', 'rejected'])
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  dateApplied?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(['manual', 'extension'])
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  cvUsed?: string;
}
