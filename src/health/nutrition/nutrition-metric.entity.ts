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

export enum MealType {
  BREAKFAST = 'breakfast',
  LUNCH = 'lunch',
  DINNER = 'dinner',
  SNACK = 'snack',
  DRINK = 'drink'
}

export enum ServingUnit {
  GRAMS = 'grams',
  OUNCES = 'ounces',
  CUPS = 'cups',
  TABLESPOONS = 'tablespoons',
  TEASPOONS = 'teaspoons',
  PIECES = 'pieces',
  SLICES = 'slices',
  MILLILITERS = 'milliliters',
  LITERS = 'liters',
  FLUID_OUNCES = 'fluid_ounces'
}

@Entity('nutrition_metrics')
@Index(['userId', 'date'])
export class NutritionMetric extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: MealType
  })
  mealType: MealType;

  @Column()
  foodName: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  servingSize: number;

  @Column({
    type: 'enum',
    enum: ServingUnit
  })
  servingUnit: ServingUnit;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  calories: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  protein: number; // in grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  carbs: number; // in grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  fats: number; // in grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  fiber: number; // in grams

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  sugar: number; // in grams

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  sodium: number; // in mg

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  waterIntake: number; // in ml

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

  // Virtual property for calorie breakdown
  get macroBreakdown(): { protein: number; carbs: number; fats: number } | null {
    if (!this.protein || !this.carbs || !this.fats) return null;

    const proteinCalories = this.protein * 4;
    const carbCalories = this.carbs * 4;
    const fatCalories = this.fats * 9;
    const totalCalories = proteinCalories + carbCalories + fatCalories;

    if (totalCalories === 0) return null;

    return {
      protein: Math.round((proteinCalories / totalCalories) * 100),
      carbs: Math.round((carbCalories / totalCalories) * 100),
      fats: Math.round((fatCalories / totalCalories) * 100)
    };
  }
}