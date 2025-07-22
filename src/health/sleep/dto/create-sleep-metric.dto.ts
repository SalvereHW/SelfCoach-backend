import {
  IsDateString,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { SleepQuality } from '../sleep-metric.entity.js';

export class CreateSleepMetricDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'bedTime must be in HH:MM format',
  })
  bedTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'wakeTime must be in HH:MM format',
  })
  wakeTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1440) // Max 24 hours in minutes
  duration?: number;

  @IsOptional()
  @IsEnum(SleepQuality)
  quality?: SleepQuality;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1440)
  deepSleepMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1440)
  remSleepMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  awakeDuringNight?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
