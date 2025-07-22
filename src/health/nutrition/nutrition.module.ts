import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NutritionService } from './nutrition.service.js';
import { NutritionController } from './nutrition.controller.js';
import { NutritionMetric } from './nutrition-metric.entity.js';
import { AuthModule } from '../../auth/auth.module.js';
import { UserModule } from '../../user/user.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([NutritionMetric]),
    ConfigModule,
    AuthModule,
    UserModule,
  ],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}
