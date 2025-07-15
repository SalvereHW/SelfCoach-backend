import { Module } from '@nestjs/common';
import { SleepModule } from './sleep/sleep.module.js';
import { NutritionModule } from './nutrition/nutrition.module.js';
import { ActivityModule } from './activity/activity.module.js';
import { DailySummaryModule } from './daily-summary/daily-summary.module.js';

@Module({
  imports: [
    SleepModule,
    NutritionModule,
    ActivityModule,
    DailySummaryModule,
  ],
  exports: [
    SleepModule,
    NutritionModule,
    ActivityModule,
    DailySummaryModule,
  ],
})
export class HealthModule {}