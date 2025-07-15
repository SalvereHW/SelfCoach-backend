import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityMetricDto } from './create-activity-metric.dto.js';

export class UpdateActivityMetricDto extends PartialType(CreateActivityMetricDto) {}