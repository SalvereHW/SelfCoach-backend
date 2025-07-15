import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
// Legacy HealthMetric import removed - using new health entities
import { HealthCondition } from '../enums/health-condition.enum.js';
import { CulturalDiet } from '../enums/cultural-diet.enum.js';
import { ActivityLevel } from '../enums/activity-level.enum.js';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  supabaseUserId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number; // in cm

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number; // in kg

  @Column({
    type: 'enum',
    enum: HealthCondition,
    array: true,
    default: [HealthCondition.NONE]
  })
  healthConditions: HealthCondition[];

  @Column({
    type: 'enum',
    enum: CulturalDiet,
    array: true,
    default: [CulturalDiet.NO_PREFERENCE]
  })
  culturalDietPreferences: CulturalDiet[];

  @Column({
    type: 'enum',
    enum: ActivityLevel,
    default: ActivityLevel.MODERATELY_ACTIVE
  })
  activityLevel: ActivityLevel;

  @Column('simple-array', { nullable: true })
  allergies: string[];

  @Column({ type: 'json', nullable: true })
  preferences: Record<string, any>;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Expose()
  @Column({ default: true })
  isActive: boolean;

  @Exclude()
  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Legacy health metrics relationship removed - using new health entities
  // healthMetrics: Promise<any[]>;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number | null {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}