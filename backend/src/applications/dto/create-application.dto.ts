import { IsString, IsUrl, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  companyName: string;

  @IsString()
  position: string;

  @IsUrl()
  jobUrl: string;

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
