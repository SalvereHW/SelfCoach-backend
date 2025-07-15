import { PartialType } from '@nestjs/mapped-types';
import { CreateSleepMetricDto } from './create-sleep-metric.dto.js';

export class UpdateSleepMetricDto extends PartialType(CreateSleepMetricDto) {}