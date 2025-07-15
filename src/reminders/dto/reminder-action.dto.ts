import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ReminderActionType } from '../entities/reminder-action.entity.js';

export class CreateReminderActionDto {
  @IsEnum(ReminderActionType)
  actionType: ReminderActionType;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}