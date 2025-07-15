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

export enum SleepQuality {
  POOR = 'poor',
  FAIR = 'fair',
  GOOD = 'good',
  EXCELLENT = 'excellent'
}

@Entity('sleep_metrics')
@Index(['userId', 'date'], { unique: true }) // One sleep record per user per day
export class SleepMetric extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time', nullable: true })
  bedTime: string; // Format: "HH:MM"

  @Column({ type: 'time', nullable: true })
  wakeTime: string; // Format: "HH:MM"

  @Column({ type: 'int', nullable: true })
  duration: number; // Total sleep duration in minutes

  @Column({
    type: 'enum',
    enum: SleepQuality,
    nullable: true
  })
  quality: SleepQuality;

  @Column({ type: 'int', nullable: true })
  deepSleepMinutes: number;

  @Column({ type: 'int', nullable: true })
  remSleepMinutes: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  awakeDuringNight: number; // Number of times awake during night

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Promise<User>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties for calculations
  get sleepEfficiency(): number | null {
    if (!this.duration || !this.bedTime || !this.wakeTime) return null;
    
    // Calculate time in bed vs actual sleep time
    const bedTimeParts = this.bedTime.split(':');
    const wakeTimeParts = this.wakeTime.split(':');
    
    const bedTimeMinutes = parseInt(bedTimeParts[0]) * 60 + parseInt(bedTimeParts[1]);
    const wakeTimeMinutes = parseInt(wakeTimeParts[0]) * 60 + parseInt(wakeTimeParts[1]);
    
    let timeInBed = wakeTimeMinutes - bedTimeMinutes;
    if (timeInBed < 0) timeInBed += 24 * 60; // Handle overnight sleep
    
    return Math.round((this.duration / timeInBed) * 100);
  }

  get qualityScore(): number {
    switch (this.quality) {
      case SleepQuality.POOR: return 1;
      case SleepQuality.FAIR: return 2;
      case SleepQuality.GOOD: return 3;
      case SleepQuality.EXCELLENT: return 4;
      default: return 0;
    }
  }
}