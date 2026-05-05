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

  @IsEnum(['applied', 'pending', 'interview', 'accepted', 'rejected'])
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  dateApplied?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
