import { IsDateString, IsOptional, IsEnum, IsArray, IsString, IsNumber, Min, Max } from 'class-validator';
import { MoodLevel, StressLevel, EnergyLevel } from '../daily-summary.entity.js';

export class CreateDailySummaryDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(MoodLevel)
  mood?: MoodLevel;

  @IsOptional()
  @IsEnum(StressLevel)
  stressLevel?: StressLevel;

  @IsOptional()
  @IsEnum(EnergyLevel)
  energyLevel?: EnergyLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @IsOptional()
  @IsNumber()
  @Min(70)
  @Max(250)
  bloodPressureSystolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(40)
  @Max(150)
  bloodPressureDiastolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}