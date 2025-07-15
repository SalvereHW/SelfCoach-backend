import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
// import { ReminderAction } from './reminder-action.entity.js';

export enum ReminderType {
  MEDICATION = 'medication',
  MEAL = 'meal',
  EXERCISE = 'exercise',
  SLEEP = 'sleep',
  WATER = 'water',
  HEALTH_CHECK = 'health_check',
  APPOINTMENT = 'appointment',
  CUSTOM = 'custom'
}

export enum ReminderFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom'
}

export enum ReminderStatus {
  ACTIVE = 'active',
  SNOOZED = 'snoozed',
  COMPLETED = 'completed',
  DISMISSED = 'dismissed',
  INACTIVE = 'inactive'
}

@Entity('reminders')
@Index(['userId', 'scheduledTime'])
@Index(['userId', 'isEnabled'])
export class Reminder extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ReminderType
  })
  type: ReminderType;

  @Column({ type: 'timestamp' })
  scheduledTime: Date;

  @Column({
    type: 'enum',
    enum: ReminderFrequency,
    default: ReminderFrequency.ONCE
  })
  frequency: ReminderFrequency;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.ACTIVE
  })
  status: ReminderStatus;

  @Column({ type: 'boolean', default: true })
  isEnabled: boolean;

  @Column('simple-array', { nullable: true })
  weekdays: number[]; // 0-6 (Sunday-Saturday) for weekly reminders

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  snoozeUntil: Date;

  @Column({ type: 'json', nullable: true })
  customData: Record<string, any>; // For storing type-specific data

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  @OneToMany('ReminderAction', 'reminder')
  actions: Promise<any[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties for reminder logic
  get isActive(): boolean {
    return this.isEnabled && this.status === ReminderStatus.ACTIVE;
  }

  get isSnoozed(): boolean {
    return this.snoozeUntil && new Date() < this.snoozeUntil;
  }

  get nextScheduledTime(): Date | null {
    if (!this.isActive || this.frequency === ReminderFrequency.ONCE) {
      return this.scheduledTime;
    }

    const now = new Date();
    const scheduled = new Date(this.scheduledTime);

    switch (this.frequency) {
      case ReminderFrequency.DAILY:
        while (scheduled <= now) {
          scheduled.setDate(scheduled.getDate() + 1);
        }
        return scheduled;

      case ReminderFrequency.WEEKLY:
        if (this.weekdays && this.weekdays.length > 0) {
          const nextWeekday = this.getNextWeekday();
          if (nextWeekday) return nextWeekday;
        }
        while (scheduled <= now) {
          scheduled.setDate(scheduled.getDate() + 7);
        }
        return scheduled;

      case ReminderFrequency.MONTHLY:
        while (scheduled <= now) {
          scheduled.setMonth(scheduled.getMonth() + 1);
        }
        return scheduled;

      default:
        return this.scheduledTime;
    }
  }

  private getNextWeekday(): Date | null {
    if (!this.weekdays || this.weekdays.length === 0) return null;

    const now = new Date();
    const currentDay = now.getDay();
    const scheduled = new Date(this.scheduledTime);

    // Find next occurrence this week
    const todayWeekdays = this.weekdays.filter(day => day > currentDay);
    if (todayWeekdays.length > 0) {
      const nextDay = Math.min(...todayWeekdays);
      const daysToAdd = nextDay - currentDay;
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + daysToAdd);
      nextDate.setHours(scheduled.getHours(), scheduled.getMinutes(), scheduled.getSeconds());
      return nextDate;
    }

    // Find first occurrence next week
    const nextWeekDay = Math.min(...this.weekdays);
    const daysToAdd = (7 - currentDay) + nextWeekDay;
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysToAdd);
    nextDate.setHours(scheduled.getHours(), scheduled.getMinutes(), scheduled.getSeconds());
    return nextDate;
  }

  shouldTrigger(): boolean {
    if (!this.isActive || this.isSnoozed) return false;
    
    const now = new Date();
    const nextTime = this.nextScheduledTime;
    
    if (!nextTime) return false;
    
    // Trigger if we're within 1 minute of scheduled time
    const timeDiff = Math.abs(now.getTime() - nextTime.getTime());
    return timeDiff <= 60000; // 1 minute tolerance
  }
}