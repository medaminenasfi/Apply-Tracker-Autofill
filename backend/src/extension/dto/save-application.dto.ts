import { IsString, IsUrl, IsOptional, IsDateString } from 'class-validator';

export class SaveApplicationDto {
  @IsString()
  companyName: string;

  @IsString()
  position: string;

  @IsUrl()
  jobUrl: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  @IsOptional()
  dateApplied?: string;
}
