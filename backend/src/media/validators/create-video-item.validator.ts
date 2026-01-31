import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateVideoItemValidator {
  @IsInt()
  @Min(1)
  seasonNumber: number;

  @IsInt()
  @Min(1)
  episodeNumber: number;

  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(1)
  durationSeconds: number;

  @IsNotEmpty()
  videoPath: string;

  @IsOptional()
  @IsString()
  subtitlePath?: string;

  @IsOptional()
  @IsString()
  thumbnailPath?: string;
}
