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

export enum InsightType {
  DAILY_SUMMARY = 'daily_summary',
  WEEKLY_SUMMARY = 'weekly_summary',
  HEALTH_TREND = 'health_trend',
  RECOMMENDATION = 'recommendation',
  ANOMALY_DETECTION = 'anomaly_detection',
  GOAL_PROGRESS = 'goal_progress'
}

export enum InsightPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('ai_insights')
@Index(['userId', 'createdAt'])
@Index(['userId', 'type'])
export class AiInsight extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: InsightType
  })
  type: InsightType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: InsightPriority,
    default: InsightPriority.MEDIUM
  })
  priority: InsightPriority;

  @Column({ type: 'json', nullable: true })
  metadata: any; // Stores structured data related to the insight

  @Column({ type: 'json', nullable: true })
  recommendations: string[]; // Actionable recommendations

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore: number; // AI confidence in the insight (0-100)

  @Column({ type: 'date' })
  insightDate: Date; // Date the insight refers to (not when it was generated)

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isDismissed: boolean;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties for easier frontend consumption
  get isNew(): boolean {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return this.createdAt > twoDaysAgo;
  }

  get isActionable(): boolean {
    return this.recommendations && this.recommendations.length > 0;
  }

  get categoryColor(): string {
    switch (this.type) {
      case InsightType.DAILY_SUMMARY: return '#4F46E5';
      case InsightType.WEEKLY_SUMMARY: return '#7C3AED';
      case InsightType.HEALTH_TREND: return '#059669';
      case InsightType.RECOMMENDATION: return '#DC2626';
      case InsightType.ANOMALY_DETECTION: return '#EA580C';
      case InsightType.GOAL_PROGRESS: return '#0284C7';
      default: return '#6B7280';
    }
  }

  get priorityColor(): string {
    switch (this.priority) {
      case InsightPriority.LOW: return '#10B981';
      case InsightPriority.MEDIUM: return '#F59E0B';
      case InsightPriority.HIGH: return '#EF4444';
      case InsightPriority.URGENT: return '#DC2626';
      default: return '#6B7280';
    }
  }
}