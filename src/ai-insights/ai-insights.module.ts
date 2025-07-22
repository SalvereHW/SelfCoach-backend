import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiInsightsService } from './ai-insights.service.js';
import { AiInsightsController } from './ai-insights.controller.js';
import { AiInsight } from './entities/ai-insight.entity.js';
import { ActivityMetric } from '../health/activity/activity-metric.entity.js';
import { SleepMetric } from '../health/sleep/sleep-metric.entity.js';
import { NutritionMetric } from '../health/nutrition/nutrition-metric.entity.js';
import { User } from '../user/entities/user.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { UserModule } from '../user/user.module.js';

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
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [AiInsightsController],
  providers: [
    AiInsightsService,
    {
      provide: 'AUTH_GUARD',
      useClass: AuthGuard,
    },
  ],
  exports: [AiInsightsService],
})
export class AiInsightsModule {}