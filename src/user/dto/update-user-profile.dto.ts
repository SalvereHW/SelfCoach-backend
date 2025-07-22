import { PartialType } from '@nestjs/mapped-types';
import { CreateUserProfileDto } from './create-user-profile.dto.js';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileDto extends PartialType(CreateUserProfileDto) {
  @IsOptional()
  @IsString()
  descopeUserId?: string;
}
