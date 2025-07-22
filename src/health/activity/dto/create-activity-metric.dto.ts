import {
  IsDateString,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import {
  ActivityType,
  ActivityIntensity,
  DistanceUnit,
} from '../activity-metric.entity.js';

export class CreateActivityMetricDto {
  @IsDateString()
  date: string;

  @IsEnum(ActivityType)
  activityType: ActivityType;

  @IsString()
  activityName: string;

  @IsNumber()
  @Min(1)
  @Max(1440) // Max 24 hours in minutes
  duration: number;

  @IsEnum(ActivityIntensity)
  intensity: ActivityIntensity;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  caloriesBurned?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  distance?: number;

  @IsOptional()
  @IsEnum(DistanceUnit)
  distanceUnit?: DistanceUnit;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  steps?: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(220)
  averageHeartRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(250)
  heartRateMax?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
