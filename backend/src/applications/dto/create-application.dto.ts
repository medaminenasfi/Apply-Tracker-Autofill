import { IsString, IsUrl, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  companyName: string;

  @IsString()
  position: string;

  @IsUrl()
  @IsOptional()
  jobUrl?: string;

  @IsEnum(['applied', 'interview', 'accepted', 'rejected'])
  @IsOptional()
  status?: string;

  @IsDateString()
  @IsOptional()
  dateApplied?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
