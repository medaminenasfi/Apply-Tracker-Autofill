import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateVaultAnswerDto {
  @IsString()
  title!: string;

  @IsString()
  category!: string;

  @IsString()
  content!: string;

  @IsBoolean()
  @IsOptional()
  favorite?: boolean;

  @IsString()
  @IsOptional()
  roleType?: string;
}

export class UpdateVaultAnswerDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  favorite?: boolean;

  @IsString()
  @IsOptional()
  roleType?: string;
}

export class SyncVaultAnswersDto {
  answers!: CreateVaultAnswerDto[];
}
