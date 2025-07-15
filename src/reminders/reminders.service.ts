import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Reminder, ReminderStatus, ReminderFrequency } from './entities/reminder.entity.js';
import { ReminderAction, ReminderActionType } from './entities/reminder-action.entity.js';
import { CreateReminderDto } from './dto/create-reminder.dto.js';
import { UpdateReminderDto } from './dto/update-reminder.dto.js';
import { CreateReminderActionDto } from './dto/reminder-action.dto.js';
import { LoggerService } from '../common/logging/logger.service.js';

export interface ReminderStatsResponse {
  totalReminders: number;
  activeReminders: number;
  completedToday: number;
  missedToday: number;
  upcomingReminders: number;
  completionRate: number; // Last 7 days
  typeBreakdown: {
    [key: string]: number;
  };
  frequencyBreakdown: {
    [key: string]: number;
  };
}

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>,
    @InjectRepository(ReminderAction)
    private reminderActionRepository: Repository<ReminderAction>,
    private readonly loggerService: LoggerService,
  ) {}

  async create(userId: number, createReminderDto: CreateReminderDto): Promise<Reminder> {
    try {
      const reminder = this.reminderRepository.create({
        ...createReminderDto,
        scheduledTime: new Date(createReminderDto.scheduledTime),
        endDate: createReminderDto.endDate ? new Date(createReminderDto.endDate) : null,
        userId,
      });

      return await this.reminderRepository.save(reminder);
    } catch (error) {
      throw new Error(`Failed to create reminder: ${error.message}`);
    }
  }

  async findAll(
    userId: number,
    isEnabled?: boolean,
    status?: ReminderStatus,
    limit?: number
  ): Promise<Reminder[]> {
    try {
      const queryBuilder = this.reminderRepository
        .createQueryBuilder('reminder')
        .where('reminder.userId = :userId', { userId })
        .orderBy('reminder.scheduledTime', 'ASC');

      if (isEnabled !== undefined) {
        queryBuilder.andWhere('reminder.isEnabled = :isEnabled', { isEnabled });
      }

      if (status) {
        queryBuilder.andWhere('reminder.status = :status', { status });
      }

      if (limit) {
        queryBuilder.limit(limit);
      }

      return await queryBuilder.getMany();
    } catch (error) {
      throw new Error(`Failed to fetch reminders: ${error.message}`);
    }
  }

  async findUpcoming(userId: number, hours: number = 24): Promise<Reminder[]> {
    try {
      const now = new Date();
      const future = new Date();
      future.setHours(future.getHours() + hours);

      return await this.reminderRepository.find({
        where: {
          userId,
          isEnabled: true,
          status: ReminderStatus.ACTIVE,
          scheduledTime: Between(now, future)
        },
        order: { scheduledTime: 'ASC' }
      });
    } catch (error) {
      throw new Error(`Failed to fetch upcoming reminders: ${error.message}`);
    }
  }

  async findOne(id: number, userId: number): Promise<Reminder> {
    try {
      const reminder = await this.reminderRepository.findOne({
        where: { id, userId }
      });

      if (!reminder) {
        throw new NotFoundException('Reminder not found');
      }

      return reminder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch reminder: ${error.message}`);
    }
  }

  async update(id: number, userId: number, updateReminderDto: UpdateReminderDto): Promise<Reminder> {
    try {
      const reminder = await this.findOne(id, userId);

      const updateData = {
        ...updateReminderDto,
        scheduledTime: updateReminderDto.scheduledTime ? new Date(updateReminderDto.scheduledTime) : reminder.scheduledTime,
        endDate: updateReminderDto.endDate ? new Date(updateReminderDto.endDate) : reminder.endDate,
      };

      await this.reminderRepository.update(id, updateData);
      return await this.findOne(id, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update reminder: ${error.message}`);
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    try {
      const reminder = await this.findOne(id, userId);
      await this.reminderRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete reminder: ${error.message}`);
    }
  }

  async completeReminder(id: number, userId: number, actionDto?: CreateReminderActionDto): Promise<ReminderAction> {
    try {
      const reminder = await this.findOne(id, userId);

      // Create action record
      const action = await this.createAction(id, userId, {
        actionType: ReminderActionType.COMPLETED,
        note: actionDto?.note,
        metadata: actionDto?.metadata
      });

      // Update reminder status if it's a one-time reminder
      if (reminder.frequency === ReminderFrequency.ONCE) {
        await this.reminderRepository.update(id, { 
          status: ReminderStatus.COMPLETED 
        });
      }

      return action;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to complete reminder: ${error.message}`);
    }
  }

  async dismissReminder(id: number, userId: number, actionDto?: CreateReminderActionDto): Promise<ReminderAction> {
    try {
      await this.findOne(id, userId);

      return await this.createAction(id, userId, {
        actionType: ReminderActionType.DISMISSED,
        note: actionDto?.note,
        metadata: actionDto?.metadata
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to dismiss reminder: ${error.message}`);
    }
  }

  async snoozeReminder(id: number, userId: number, minutes: number, actionDto?: CreateReminderActionDto): Promise<ReminderAction> {
    try {
      const reminder = await this.findOne(id, userId);

      const snoozeUntil = new Date();
      snoozeUntil.setMinutes(snoozeUntil.getMinutes() + minutes);

      await this.reminderRepository.update(id, { 
        snoozeUntil,
        status: ReminderStatus.SNOOZED 
      });

      return await this.createAction(id, userId, {
        actionType: ReminderActionType.SNOOZED,
        note: actionDto?.note,
        metadata: { ...actionDto?.metadata, snoozeMinutes: minutes }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to snooze reminder: ${error.message}`);
    }
  }

  async getStats(userId: number): Promise<ReminderStatsResponse> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get all reminders for user
      const allReminders = await this.reminderRepository.find({
        where: { userId }
      });

      const activeReminders = allReminders.filter(r => r.isEnabled && r.status === ReminderStatus.ACTIVE);

      // Get today's actions
      const todayActions = await this.reminderActionRepository.find({
        where: {
          userId,
          actionTime: Between(today, tomorrow)
        }
      });

      const completedToday = todayActions.filter(a => a.actionType === ReminderActionType.COMPLETED).length;
      const missedToday = todayActions.filter(a => a.actionType === ReminderActionType.DISMISSED).length;

      // Get completion rate for last 7 days
      const weekActions = await this.reminderActionRepository.find({
        where: {
          userId,
          actionTime: MoreThan(sevenDaysAgo)
        }
      });

      const weekCompleted = weekActions.filter(a => a.actionType === ReminderActionType.COMPLETED).length;
      const weekTotal = weekActions.length;
      const completionRate = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;

      // Type and frequency breakdowns
      const typeBreakdown = allReminders.reduce((acc, reminder) => {
        acc[reminder.type] = (acc[reminder.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const frequencyBreakdown = allReminders.reduce((acc, reminder) => {
        acc[reminder.frequency] = (acc[reminder.frequency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalReminders: allReminders.length,
        activeReminders: activeReminders.length,
        completedToday,
        missedToday,
        upcomingReminders: (await this.findUpcoming(userId)).length,
        completionRate,
        typeBreakdown,
        frequencyBreakdown
      };
    } catch (error) {
      throw new Error(`Failed to get reminder stats: ${error.message}`);
    }
  }

  private async createAction(reminderId: number, userId: number, actionDto: CreateReminderActionDto): Promise<ReminderAction> {
    const action = this.reminderActionRepository.create({
      reminderId,
      userId,
      ...actionDto
    });

    return await this.reminderActionRepository.save(action);
  }

  // Scheduled task to process reminders (runs every minute)
  @Cron(CronExpression.EVERY_MINUTE)
  async processReminders(): Promise<void> {
    try {
      const activeReminders = await this.reminderRepository.find({
        where: {
          isEnabled: true,
          status: ReminderStatus.ACTIVE
        }
      });

      for (const reminder of activeReminders) {
        if (reminder.shouldTrigger()) {
          await this.triggerReminder(reminder);
        }

        // Check if snoozed reminders should be reactivated
        if (reminder.status === ReminderStatus.SNOOZED && 
            reminder.snoozeUntil && 
            new Date() >= reminder.snoozeUntil) {
          await this.reminderRepository.update(reminder.id, {
            status: ReminderStatus.ACTIVE,
            snoozeUntil: null
          });
        }
      }
    } catch (error) {
      this.loggerService.error('Error processing reminders', error, {
        endpoint: 'reminders/process',
        action: 'process_reminders'
      });
    }
  }

  private async triggerReminder(reminder: Reminder): Promise<void> {
    try {
      // Create trigger action
      await this.createAction(reminder.id, reminder.userId, {
        actionType: ReminderActionType.TRIGGERED
      });

      // Here you would integrate with push notification service
      this.loggerService.info('Reminder triggered', {
        endpoint: 'reminders/trigger',
        action: 'trigger_reminder',
        userId: reminder.userId
      });
      
      // For recurring reminders, update the scheduled time
      if (reminder.frequency !== ReminderFrequency.ONCE) {
        const nextTime = reminder.nextScheduledTime;
        if (nextTime) {
          await this.reminderRepository.update(reminder.id, {
            scheduledTime: nextTime
          });
        }
      }
    } catch (error) {
      this.loggerService.error(`Error triggering reminder ${reminder.id}`, error, {
        endpoint: 'reminders/trigger',
        action: 'trigger_reminder',
        userId: reminder.userId
      });
    }
  }
}