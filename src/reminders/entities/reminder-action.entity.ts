import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { Reminder } from './reminder.entity.js';

export enum ReminderActionType {
  COMPLETED = 'completed',
  DISMISSED = 'dismissed',
  SNOOZED = 'snoozed',
  TRIGGERED = 'triggered'
}

@Entity('reminder_actions')
@Index(['reminderId', 'actionTime'])
@Index(['userId', 'actionTime'])
export class ReminderAction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reminderId: number;

  @Column({
    type: 'enum',
    enum: ReminderActionType
  })
  actionType: ReminderActionType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  actionTime: Date;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // For storing action-specific data

  @Column()
  userId: number;

  @ManyToOne(() => Reminder, (reminder) => reminder.actions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reminderId' })
  reminder: Promise<Reminder>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  @CreateDateColumn()
  createdAt: Date;
}