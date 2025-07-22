import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import {
  SessionType,
  SessionDifficulty,
} from '../entities/wellness-session.entity.js';

export class CreateWellnessSessionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(SessionType)
  type: SessionType;

  @IsNumber()
  @Min(1)
  @Max(180) // Max 3 hours
  duration: number;

  @IsOptional()
  @IsEnum(SessionDifficulty)
  difficulty?: SessionDifficulty;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
