import { IsDateString, IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { MealType, ServingUnit } from '../nutrition-metric.entity.js';

export class CreateNutritionMetricDto {
  @IsDateString()
  date: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsString()
  foodName: string;

  @IsNumber()
  @Min(0)
  @Max(10000)
  servingSize: number;

  @IsEnum(ServingUnit)
  servingUnit: ServingUnit;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  calories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  protein?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  carbs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  fats?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  fiber?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  sugar?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50000)
  sodium?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5000)
  waterIntake?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}