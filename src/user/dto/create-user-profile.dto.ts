import { IsString, IsEmail, IsOptional, IsDateString, IsArray, IsEnum, IsNumber, Min, Max, IsObject } from 'class-validator';
import { HealthCondition } from '../enums/health-condition.enum.js';
import { CulturalDiet } from '../enums/cultural-diet.enum.js';
import { ActivityLevel } from '../enums/activity-level.enum.js';

export class CreateUserProfileDto {
  @IsString()
  supabaseUserId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  height?: number; // in cm

  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  weight?: number; // in kg

  @IsOptional()
  @IsArray()
  @IsEnum(HealthCondition, { each: true })
  healthConditions?: HealthCondition[];

  @IsOptional()
  @IsArray()
  @IsEnum(CulturalDiet, { each: true })
  culturalDietPreferences?: CulturalDiet[];

  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}