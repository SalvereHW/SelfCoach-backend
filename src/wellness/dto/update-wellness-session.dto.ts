import { PartialType } from '@nestjs/mapped-types';
import { CreateWellnessSessionDto } from './create-wellness-session.dto.js';

export class UpdateWellnessSessionDto extends PartialType(
  CreateWellnessSessionDto,
) {}
