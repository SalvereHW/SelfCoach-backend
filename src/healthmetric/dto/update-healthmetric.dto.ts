import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthmetricDto } from './create-healthmetric.dto.js';

export class UpdateHealthmetricDto extends PartialType(CreateHealthmetricDto) {}
