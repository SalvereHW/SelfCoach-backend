import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { InsightType } from '../entities/ai-insight.entity.js';

export class GenerateInsightDto {
  @IsEnum(InsightType)
  @IsOptional()
  type?: InsightType;

  @IsDateString()
  @IsOptional()
  date?: string; // Date to generate insight for, defaults to today

  @IsOptional()
  includeRecommendations?: boolean = true;
}
