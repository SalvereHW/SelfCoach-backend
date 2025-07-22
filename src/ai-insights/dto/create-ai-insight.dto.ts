import { IsEnum, IsString, IsOptional, IsNumber, IsArray, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { InsightType, InsightPriority } from '../entities/ai-insight.entity.js';

export class CreateAiInsightDto {
  @IsEnum(InsightType)
  type: InsightType;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(InsightPriority)
  @IsOptional()
  priority?: InsightPriority;

  @IsOptional()
  metadata?: any;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  recommendations?: string[];

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  confidenceScore?: number;

  @IsDateString()
  insightDate: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsBoolean()
  @IsOptional()
  isDismissed?: boolean;
}