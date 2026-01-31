import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateMediaValidator {
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['movie', 'series'])
  type: 'movie' | 'series';

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsString()
  thumbnailPath: string;

  @IsString()
  videoPath: string;

  @IsOptional()
  @IsString()
  subtitlePath?: string;

  @IsOptional()
  @IsString()
  trailerUrl?: string;
}
