import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    BaseEntity,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../../user/entities/user.entity.js'; // Remove the .js extension
  
  @Entity()
  export class HealthMetric extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    type: string; // e.g., "blood pressure", "heart rate"
  
    @Column()
    value: string;
  
    @ManyToOne(() => User, (user) => user.healthMetrics)
    @JoinColumn({ name: 'userId'}) // Foreign key in HealthMetric table
    user: Promise<User>; // Lazy loaded relationship
  }