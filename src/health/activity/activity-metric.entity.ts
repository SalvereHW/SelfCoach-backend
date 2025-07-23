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

export enum ActivityType {
  CARDIO = 'cardio',
  STRENGTH = 'strength',
  FLEXIBILITY = 'flexibility',
  SPORTS = 'sports',
  WALKING = 'walking',
  RUNNING = 'running',
  CYCLING = 'cycling',
  SWIMMING = 'swimming',
  YOGA = 'yoga',
  GYM = 'gym',
  PILATES = 'pilates',
  DANCE = 'dance',
  HIKING = 'hiking',
  OTHER = 'other',
}

export enum ActivityIntensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum DistanceUnit {
  KILOMETERS = 'kilometers',
  MILES = 'miles',
  METERS = 'meters',
  YARDS = 'yards',
}

@Entity('activity_metrics')
@Index(['userId', 'date'])
export class ActivityMetric extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: ActivityType,
  })
  activityType: ActivityType;

  @Column()
  activityName: string;

  @Column({ type: 'int' })
  duration: number; // Duration in minutes

  @Column({
    type: 'enum',
    enum: ActivityIntensity,
  })
  intensity: ActivityIntensity;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  caloriesBurned: number;

  @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
  distance: number;

  @Column({
    type: 'enum',
    enum: DistanceUnit,
    nullable: true,
  })
  distanceUnit: DistanceUnit;

  @Column({ type: 'int', nullable: true })
  steps: number;

  @Column({ type: 'int', nullable: true })
  averageHeartRate: number; // BPM

  @Column({ type: 'int', nullable: true })
  heartRateMax: number; // BPM

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
  get intensityScore(): number {
    switch (this.intensity) {
      case ActivityIntensity.LOW:
        return 1;
      case ActivityIntensity.MODERATE:
        return 2;
      case ActivityIntensity.HIGH:
        return 3;
      case ActivityIntensity.VERY_HIGH:
        return 4;
      default:
        return 0;
    }
  }

  get pace(): number | null {
    if (!this.distance || !this.duration || this.duration === 0) return null;

    // Return pace as minutes per kilometer or mile
    return Number((this.duration / this.distance).toFixed(2));
  }

  get averageSpeed(): number | null {
    if (!this.distance || !this.duration || this.duration === 0) return null;

    // Return speed as distance per hour
    const hours = this.duration / 60;
    return Number((this.distance / hours).toFixed(2));
  }

  get estimatedCaloriesFromMET(): number | null {
    // Rough estimation based on activity type and intensity
    // This would ideally use user weight from profile
    const baseMET = this.getBaseMETValue();
    const intensityMultiplier = this.getIntensityMultiplier();
    const estimatedWeight = 70; // Default weight in kg

    // Calories = MET × weight (kg) × time (hours)
    const hours = this.duration / 60;
    return Math.round(baseMET * intensityMultiplier * estimatedWeight * hours);
  }

  private getBaseMETValue(): number {
    switch (this.activityType) {
      case ActivityType.WALKING:
        return 3.5;
      case ActivityType.RUNNING:
        return 8.0;
      case ActivityType.CYCLING:
        return 6.0;
      case ActivityType.SWIMMING:
        return 7.0;
      case ActivityType.STRENGTH:
        return 4.5;
      case ActivityType.YOGA:
        return 2.5;
      case ActivityType.DANCE:
        return 5.0;
      case ActivityType.HIKING:
        return 6.0;
      case ActivityType.GYM:
        return 5.0;
      default:
        return 4.0;
    }
  }

  private getIntensityMultiplier(): number {
    switch (this.intensity) {
      case ActivityIntensity.LOW:
        return 0.8;
      case ActivityIntensity.MODERATE:
        return 1.0;
      case ActivityIntensity.HIGH:
        return 1.3;
      case ActivityIntensity.VERY_HIGH:
        return 1.6;
      default:
        return 1.0;
    }
  }
}
