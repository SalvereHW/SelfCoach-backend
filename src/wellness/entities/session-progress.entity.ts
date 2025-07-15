import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity.js';
import { WellnessSession } from './wellness-session.entity.js';

export enum SessionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

@Entity('session_progress')
@Index(['userId', 'sessionId'])
@Index(['userId', 'status'])
export class SessionProgress extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: number;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.NOT_STARTED
  })
  status: SessionStatus;

  @Column({ type: 'int', default: 0 })
  progressTime: number; // Time spent in seconds

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  pausedAt: Date;

  @Column({ type: 'int', nullable: true, default: null })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'json', nullable: true })
  sessionData: Record<string, any>; // For storing session-specific progress data

  @ManyToOne(() => WellnessSession, (session) => session.sessionProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  wellnessSession: Promise<WellnessSession>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get progressPercentage(): number {
    if (!this.progressTime) return 0;
    
    // This would ideally use the session duration from the related WellnessSession
    // For now, we'll assume a default duration that can be overridden
    const sessionDuration = this.sessionData?.duration || 600; // 10 minutes default in seconds
    return Math.min(Math.round((this.progressTime / sessionDuration) * 100), 100);
  }

  get isCompleted(): boolean {
    return this.status === SessionStatus.COMPLETED;
  }

  get duration(): number {
    if (!this.startedAt) return 0;
    
    const endTime = this.completedAt || new Date();
    return Math.floor((endTime.getTime() - this.startedAt.getTime()) / 1000);
  }

  get hasRating(): boolean {
    return this.rating !== null && this.rating !== undefined;
  }
}