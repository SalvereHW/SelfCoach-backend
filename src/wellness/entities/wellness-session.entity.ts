import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SessionType {
  MEDITATION = 'meditation',
  BREATHING = 'breathing',
  YOGA = 'yoga',
  MINDFULNESS = 'mindfulness',
  STRESS_RELIEF = 'stress_relief',
  SLEEP_AID = 'sleep_aid',
  FOCUS = 'focus',
  ENERGY_BOOST = 'energy_boost',
  ANXIETY_RELIEF = 'anxiety_relief',
  MOTIVATION = 'motivation',
  GRATITUDE = 'gratitude',
  VISUALIZATION = 'visualization'
}

export enum SessionDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

@Entity('wellness_sessions')
@Index(['type', 'difficulty'])
@Index(['isPremium', 'isActive'])
export class WellnessSession extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: SessionType
  })
  type: SessionType;

  @Column({ type: 'int' })
  duration: number; // Duration in minutes

  @Column({
    type: 'enum',
    enum: SessionDifficulty,
    default: SessionDifficulty.BEGINNER
  })
  difficulty: SessionDifficulty;

  @Column({ nullable: true })
  audioUrl: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // For storing session-specific data

  @Column({ type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  totalSessions: number; // Counter for analytics

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @OneToMany('SessionProgress', 'wellnessSession')
  sessionProgress: Promise<any[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual properties
  get durationFormatted(): string {
    if (this.duration < 60) {
      return `${this.duration} min`;
    }
    const hours = Math.floor(this.duration / 60);
    const minutes = this.duration % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  get difficultyLevel(): number {
    switch (this.difficulty) {
      case SessionDifficulty.BEGINNER: return 1;
      case SessionDifficulty.INTERMEDIATE: return 2;
      case SessionDifficulty.ADVANCED: return 3;
      default: return 1;
    }
  }

  get isPopular(): boolean {
    return this.totalSessions > 100 && this.averageRating > 4.0;
  }
}