import { PartialType } from '@nestjs/mapped-types';
import { CreateDailySummaryDto } from './create-daily-summary.dto.js';

export class UpdateDailySummaryDto extends PartialType(CreateDailySummaryDto) {}
