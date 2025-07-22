import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiInsightsService } from './ai-insights.service.js';
import { AiInsightsController } from './ai-insights.controller.js';
import { AiInsight } from './entities/ai-insight.entity.js';
import { ActivityMetric } from '../health/activity/activity-metric.entity.js';
import { SleepMetric } from '../health/sleep/sleep-metric.entity.js';
import { NutritionMetric } from '../health/nutrition/nutrition-metric.entity.js';
import { User } from '../user/entities/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiInsight,
      ActivityMetric,
      SleepMetric,
      NutritionMetric,
      User,
    ]),
    ConfigModule,
  ],
  controllers: [AiInsightsController],
  providers: [AiInsightsService],
  exports: [AiInsightsService],
})
export class AiInsightsModule {}