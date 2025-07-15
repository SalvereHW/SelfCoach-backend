import { IsEnum, IsOptional, IsNumber, IsString, IsObject, Min, Max } from 'class-validator';
import { SessionStatus } from '../entities/session-progress.entity.js';

export class StartSessionDto {
  @IsOptional()
  @IsObject()
  sessionData?: Record<string, any>;
}

export class UpdateSessionProgressDto {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  progressTime?: number;

  @IsOptional()
  @IsObject()
  sessionData?: Record<string, any>;
}

export class CompleteSessionDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsObject()
  sessionData?: Record<string, any>;
}