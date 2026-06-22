import { IsString, IsUrl, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  companyName!: string;

  @IsString()
  position!: string;

  @IsUrl({}, { message: 'Invalid URL format' })
  jobUrl!: string;

  @IsEnum(['applied', 'interview', 'accepted', 'rejected'])
  status!: string;

  @IsDateString()
  dateApplied!: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(['manual', 'extension'])
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  cvUsed?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
