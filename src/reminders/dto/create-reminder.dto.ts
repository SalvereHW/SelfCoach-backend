import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean, IsArray, IsNumber, IsObject, Min, Max } from 'class-validator';
import { ReminderType, ReminderFrequency } from '../entities/reminder.entity.js';

export class CreateReminderDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReminderType)
  type: ReminderType;

  @IsDateString()
  scheduledTime: string;

  @IsOptional()
  @IsEnum(ReminderFrequency)
  frequency?: ReminderFrequency;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  weekdays?: number[];

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsObject()
  customData?: Record<string, any>;
}