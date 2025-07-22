import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RemindersService } from './reminders.service.js';
import { CreateReminderDto } from './dto/create-reminder.dto.js';
import { UpdateReminderDto } from './dto/update-reminder.dto.js';
import { CreateReminderActionDto } from './dto/reminder-action.dto.js';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard.js';
import { ReminderStatus } from './entities/reminder.entity.js';

@Controller('api/reminders')
@UseGuards(AuthGuard)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  create(
    @Body() createReminderDto: CreateReminderDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.remindersService.create(req.user.id, createReminderDto);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('isEnabled') isEnabled?: boolean,
    @Query('status') status?: ReminderStatus,
    @Query('limit') limit?: number,
  ) {
    return this.remindersService.findAll(req.user.id, isEnabled, status, limit);
  }

  @Get('upcoming')
  findUpcoming(
    @Request() req: AuthenticatedRequest,
    @Query('hours') hours?: number,
  ) {
    return this.remindersService.findUpcoming(req.user.id, hours);
  }

  @Get('stats')
  getStats(@Request() req: AuthenticatedRequest) {
    return this.remindersService.getStats(req.user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.remindersService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReminderDto: UpdateReminderDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.remindersService.update(id, req.user.id, updateReminderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.remindersService.remove(id, req.user.id);
  }

  @Post(':id/complete')
  complete(
    @Param('id', ParseIntPipe) id: number,
    @Body() actionDto: CreateReminderActionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.remindersService.completeReminder(id, req.user.id, actionDto);
  }

  @Post(':id/dismiss')
  dismiss(
    @Param('id', ParseIntPipe) id: number,
    @Body() actionDto: CreateReminderActionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.remindersService.dismissReminder(id, req.user.id, actionDto);
  }

  @Post(':id/snooze')
  snooze(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { minutes: number } & CreateReminderActionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.remindersService.snoozeReminder(
      id,
      req.user.id,
      body.minutes,
      body,
    );
  }
}
