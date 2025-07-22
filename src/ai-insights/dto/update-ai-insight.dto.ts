import { PartialType } from '@nestjs/mapped-types';
import { CreateAiInsightDto } from './create-ai-insight.dto.js';

export class UpdateAiInsightDto extends PartialType(CreateAiInsightDto) {}
