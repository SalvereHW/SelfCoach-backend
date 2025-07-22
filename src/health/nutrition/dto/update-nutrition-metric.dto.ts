import { PartialType } from '@nestjs/mapped-types';
import { CreateNutritionMetricDto } from './create-nutrition-metric.dto.js';

export class UpdateNutritionMetricDto extends PartialType(
  CreateNutritionMetricDto,
) {}
