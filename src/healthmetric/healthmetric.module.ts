import { Module } from '@nestjs/common';
import { HealthmetricService } from './healthmetric.service.js';
import { HealthmetricController } from './healthmetric.controller.js';
import { HealthMetric } from './entities/healthmetric.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([HealthMetric]),
  ],
  controllers: [HealthmetricController],
  providers: [HealthmetricService],
})
export class HealthmetricModule {}
