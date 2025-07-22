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

export enum MoodLevel {
  VERY_SAD = 1,
  SAD = 2,
  NEUTRAL = 3,
  HAPPY = 4,
  VERY_HAPPY = 5,
}

export enum StressLevel {
  VERY_LOW = 1,
  LOW = 2,
  MODERATE = 3,
  HIGH = 4,
  VERY_HIGH = 5,
}

export enum EnergyLevel {
  VERY_LOW = 1,
  LOW = 2,
  MODERATE = 3,
  HIGH = 4,
  VERY_HIGH = 5,
}

@Entity('daily_summaries')
@Index(['userId', 'date'], { unique: true }) // One summary per user per day
export class DailySummary extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: MoodLevel,
    nullable: true,
  })
  mood: MoodLevel;

  @Column({
    type: 'enum',
    enum: StressLevel,
    nullable: true,
  })
  stressLevel: StressLevel;

  @Column({
    type: 'enum',
    enum: EnergyLevel,
    nullable: true,
  })
  energyLevel: EnergyLevel;

  @Column('simple-array', { nullable: true })
  symptoms: string[];

  @Column({ type: 'int', nullable: true })
  bloodPressureSystolic: number; // mmHg

  @Column({ type: 'int', nullable: true })
  bloodPressureDiastolic: number; // mmHg

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number; // in kg

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

  // Virtual properties for analytics
  get wellnessScore(): number | null {
    const scores = [];

    if (this.mood !== null && this.mood !== undefined) scores.push(this.mood);
    if (this.energyLevel !== null && this.energyLevel !== undefined)
      scores.push(this.energyLevel);
    if (this.stressLevel !== null && this.stressLevel !== undefined) {
      // Invert stress level (lower stress = higher score)
      scores.push(6 - this.stressLevel);
    }

    if (scores.length === 0) return null;

    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round(average * 100) / 100;
  }

  get bloodPressureCategory(): string | null {
    if (!this.bloodPressureSystolic || !this.bloodPressureDiastolic)
      return null;

    const systolic = this.bloodPressureSystolic;
    const diastolic = this.bloodPressureDiastolic;

    if (systolic < 120 && diastolic < 80) return 'Normal';
    if (systolic < 130 && diastolic < 80) return 'Elevated';
    if (
      (systolic >= 130 && systolic < 140) ||
      (diastolic >= 80 && diastolic < 90)
    )
      return 'Stage 1 Hypertension';
    if (systolic >= 140 || diastolic >= 90) return 'Stage 2 Hypertension';
    if (systolic > 180 || diastolic > 120) return 'Hypertensive Crisis';

    return 'Unknown';
  }

  get hasSymptoms(): boolean {
    return this.symptoms && this.symptoms.length > 0;
  }
}
