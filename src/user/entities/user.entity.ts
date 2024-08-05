import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { HealthMetric } from '../../healthmetric/entities/healthmetric.entity.js'; // Remove the .js extension

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  age: number;

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Expose()
  @Column({ default: true })
  isActive: boolean;

  @Exclude()
  @Column({ default: false })
  isAdmin: boolean;

  @OneToMany(() => HealthMetric, (healthMetric) => healthMetric.user)
  healthMetrics: Promise<HealthMetric[]>; // Lazy loaded relationship
}