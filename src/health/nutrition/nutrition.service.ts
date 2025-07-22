import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { NutritionMetric, MealType } from './nutrition-metric.entity.js';
import { CreateNutritionMetricDto } from './dto/create-nutrition-metric.dto.js';
import { UpdateNutritionMetricDto } from './dto/update-nutrition-metric.dto.js';
import { LoggerService } from '../../common/logging/logger.service.js';

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  totalWater: number;
  mealBreakdown: {
    [key in MealType]: {
      calories: number;
      count: number;
    };
  };
}

export interface NutritionStatsResponse {
  averageDailyCalories: number;
  averageDailyProtein: number;
  averageDailyCarbs: number;
  averageDailyFats: number;
  averageDailyWater: number;
  totalDays: number;
  macroBreakdown: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionMetric)
    private nutritionMetricRepository: Repository<NutritionMetric>,
    private readonly loggerService: LoggerService,
  ) {}

  async create(
    userId: number,
    createNutritionMetricDto: CreateNutritionMetricDto,
  ): Promise<NutritionMetric> {
    const logContext = {
      userId,
      endpoint: 'health/nutrition/create',
      action: 'create_nutrition_metric',
    };

    try {
      const nutritionMetric = this.nutritionMetricRepository.create({
        ...createNutritionMetricDto,
        date: new Date(createNutritionMetricDto.date),
        userId,
      });

      const savedNutritionMetric =
        await this.nutritionMetricRepository.save(nutritionMetric);

      this.loggerService.info('Nutrition metric created successfully', {
        ...logContext,
        nutritionMetricId: savedNutritionMetric.id,
        mealType: savedNutritionMetric.mealType,
      });

      this.loggerService.logDataAccess('create', 'nutrition_metric', {
        ...logContext,
        nutritionMetricId: savedNutritionMetric.id,
      });

      return savedNutritionMetric;
    } catch (error) {
      this.loggerService.error(
        'Failed to create nutrition metric',
        error,
        logContext,
      );
      throw new Error(`Failed to create nutrition metric: ${error.message}`);
    }
  }

  async findAll(
    userId: number,
    startDate?: string,
    endDate?: string,
    mealType?: MealType,
    limit?: number,
  ): Promise<NutritionMetric[]> {
    const logContext = {
      userId,
      endpoint: 'health/nutrition/find-all',
      action: 'fetch_nutrition_metrics',
    };

    try {
      const queryBuilder = this.nutritionMetricRepository
        .createQueryBuilder('nutrition')
        .where('nutrition.userId = :userId', { userId })
        .orderBy('nutrition.date', 'DESC')
        .addOrderBy('nutrition.createdAt', 'DESC');

      if (startDate && endDate) {
        queryBuilder.andWhere(
          'nutrition.date BETWEEN :startDate AND :endDate',
          {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          },
        );
      }

      if (mealType) {
        queryBuilder.andWhere('nutrition.mealType = :mealType', { mealType });
      }

      if (limit) {
        queryBuilder.limit(limit);
      }

      const results = await queryBuilder.getMany();

      this.loggerService.info(`Retrieved ${results.length} nutrition metrics`, {
        ...logContext,
        mealType: mealType || 'all',
      });

      this.loggerService.logDataAccess('read', 'nutrition_metric', {
        ...logContext,
        recordCount: results.length,
      });

      return results;
    } catch (error) {
      this.loggerService.error(
        'Failed to fetch nutrition metrics',
        error,
        logContext,
      );
      throw new Error(`Failed to fetch nutrition metrics: ${error.message}`);
    }
  }

  async findOne(id: number, userId: number): Promise<NutritionMetric> {
    const logContext = {
      userId,
      endpoint: 'health/nutrition/find-one',
      action: 'fetch_nutrition_metric',
    };

    try {
      const nutritionMetric = await this.nutritionMetricRepository.findOne({
        where: { id, userId },
      });

      if (!nutritionMetric) {
        this.loggerService.warn('Nutrition metric not found', {
          ...logContext,
          nutritionMetricId: id,
        });
        throw new NotFoundException('Nutrition metric not found');
      }

      this.loggerService.info('Nutrition metric retrieved successfully', {
        ...logContext,
        nutritionMetricId: id,
      });

      this.loggerService.logDataAccess('read', 'nutrition_metric', {
        ...logContext,
        nutritionMetricId: id,
      });

      return nutritionMetric;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to fetch nutrition metric', error, {
        ...logContext,
        nutritionMetricId: id,
      });
      throw new Error(`Failed to fetch nutrition metric: ${error.message}`);
    }
  }

  async update(
    id: number,
    userId: number,
    updateNutritionMetricDto: UpdateNutritionMetricDto,
  ): Promise<NutritionMetric> {
    const logContext = {
      userId,
      endpoint: 'health/nutrition/update',
      action: 'update_nutrition_metric',
    };

    try {
      const nutritionMetric = await this.findOne(id, userId);

      const updateData = {
        ...updateNutritionMetricDto,
        date: updateNutritionMetricDto.date
          ? new Date(updateNutritionMetricDto.date)
          : nutritionMetric.date,
      };

      await this.nutritionMetricRepository.update(id, updateData);
      const updatedNutritionMetric = await this.findOne(id, userId);

      this.loggerService.info('Nutrition metric updated successfully', {
        ...logContext,
        nutritionMetricId: id,
      });

      this.loggerService.logDataAccess('update', 'nutrition_metric', {
        ...logContext,
        nutritionMetricId: id,
      });

      return updatedNutritionMetric;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to update nutrition metric', error, {
        ...logContext,
        nutritionMetricId: id,
      });
      throw new Error(`Failed to update nutrition metric: ${error.message}`);
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    const logContext = {
      userId,
      endpoint: 'health/nutrition/remove',
      action: 'delete_nutrition_metric',
    };

    try {
      await this.findOne(id, userId);
      await this.nutritionMetricRepository.delete(id);

      this.loggerService.info('Nutrition metric deleted successfully', {
        ...logContext,
        nutritionMetricId: id,
      });

      this.loggerService.logDataAccess('delete', 'nutrition_metric', {
        ...logContext,
        nutritionMetricId: id,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to delete nutrition metric', error, {
        ...logContext,
        nutritionMetricId: id,
      });
      throw new Error(`Failed to delete nutrition metric: ${error.message}`);
    }
  }

  async getDailySummary(
    userId: number,
    date: string,
  ): Promise<DailyNutritionSummary> {
    const logContext = {
      userId,
      endpoint: 'health/nutrition/daily-summary',
      action: 'calculate_daily_nutrition_summary',
    };

    try {
      const targetDate = new Date(date);
      const nutritionMetrics = await this.nutritionMetricRepository.find({
        where: {
          userId,
          date: targetDate,
        },
      });

      this.loggerService.info('Daily nutrition summary calculation initiated', {
        ...logContext,
        date: date,
        recordsFound: nutritionMetrics.length,
      });

      this.loggerService.logDataAccess('read', 'nutrition_metric_summary', {
        ...logContext,
        recordCount: nutritionMetrics.length,
      });

      const summary: DailyNutritionSummary = {
        date,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        totalFiber: 0,
        totalSugar: 0,
        totalSodium: 0,
        totalWater: 0,
        mealBreakdown: {
          [MealType.BREAKFAST]: { calories: 0, count: 0 },
          [MealType.LUNCH]: { calories: 0, count: 0 },
          [MealType.DINNER]: { calories: 0, count: 0 },
          [MealType.SNACK]: { calories: 0, count: 0 },
          [MealType.DRINK]: { calories: 0, count: 0 },
        },
      };

      nutritionMetrics.forEach((metric) => {
        summary.totalCalories += metric.calories || 0;
        summary.totalProtein += metric.protein || 0;
        summary.totalCarbs += metric.carbs || 0;
        summary.totalFats += metric.fats || 0;
        summary.totalFiber += metric.fiber || 0;
        summary.totalSugar += metric.sugar || 0;
        summary.totalSodium += metric.sodium || 0;
        summary.totalWater += metric.waterIntake || 0;

        summary.mealBreakdown[metric.mealType].calories += metric.calories || 0;
        summary.mealBreakdown[metric.mealType].count += 1;
      });

      // Round all values to 2 decimal places
      Object.keys(summary).forEach((key) => {
        if (typeof summary[key] === 'number') {
          summary[key] = Math.round(summary[key] * 100) / 100;
        }
      });

      this.loggerService.info(
        'Daily nutrition summary calculated successfully',
        {
          ...logContext,
          summaryGenerated: true,
        },
      );

      return summary;
    } catch (error) {
      this.loggerService.error(
        'Failed to get daily nutrition summary',
        error,
        logContext,
      );
      throw new Error(
        `Failed to get daily nutrition summary: ${error.message}`,
      );
    }
  }

  async getStats(
    userId: number,
    days: number = 30,
  ): Promise<NutritionStatsResponse> {
    const logContext = {
      userId,
      endpoint: 'health/nutrition/stats',
      action: 'calculate_nutrition_stats',
    };

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const nutritionMetrics = await this.nutritionMetricRepository.find({
        where: {
          userId,
          date: Between(startDate, endDate),
        },
      });

      this.loggerService.info('Nutrition stats calculation initiated', {
        ...logContext,
        daysRequested: days,
        recordsFound: nutritionMetrics.length,
      });

      this.loggerService.logDataAccess('read', 'nutrition_metric_stats', {
        ...logContext,
        recordCount: nutritionMetrics.length,
      });

      if (nutritionMetrics.length === 0) {
        this.loggerService.warn(
          'No nutrition data found for stats calculation',
          logContext,
        );
        return {
          averageDailyCalories: 0,
          averageDailyProtein: 0,
          averageDailyCarbs: 0,
          averageDailyFats: 0,
          averageDailyWater: 0,
          totalDays: 0,
          macroBreakdown: { protein: 0, carbs: 0, fats: 0 },
        };
      }

      // Group by date
      const dailyTotals = new Map<
        string,
        {
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          water: number;
        }
      >();

      nutritionMetrics.forEach((metric) => {
        const dateKey = metric.date.toISOString().split('T')[0];
        if (!dailyTotals.has(dateKey)) {
          dailyTotals.set(dateKey, {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            water: 0,
          });
        }

        const daily = dailyTotals.get(dateKey)!;
        daily.calories += metric.calories || 0;
        daily.protein += metric.protein || 0;
        daily.carbs += metric.carbs || 0;
        daily.fats += metric.fats || 0;
        daily.water += metric.waterIntake || 0;
      });

      const daysCount = dailyTotals.size;
      const totals = Array.from(dailyTotals.values()).reduce(
        (acc, daily) => ({
          calories: acc.calories + daily.calories,
          protein: acc.protein + daily.protein,
          carbs: acc.carbs + daily.carbs,
          fats: acc.fats + daily.fats,
          water: acc.water + daily.water,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 },
      );

      const averageProtein = totals.protein / daysCount;
      const averageCarbs = totals.carbs / daysCount;
      const averageFats = totals.fats / daysCount;

      const proteinCalories = averageProtein * 4;
      const carbCalories = averageCarbs * 4;
      const fatCalories = averageFats * 9;
      const totalMacroCalories = proteinCalories + carbCalories + fatCalories;

      const stats = {
        averageDailyCalories: Math.round(totals.calories / daysCount),
        averageDailyProtein: Math.round(averageProtein * 100) / 100,
        averageDailyCarbs: Math.round(averageCarbs * 100) / 100,
        averageDailyFats: Math.round(averageFats * 100) / 100,
        averageDailyWater: Math.round(totals.water / daysCount),
        totalDays: daysCount,
        macroBreakdown:
          totalMacroCalories > 0
            ? {
                protein: Math.round(
                  (proteinCalories / totalMacroCalories) * 100,
                ),
                carbs: Math.round((carbCalories / totalMacroCalories) * 100),
                fats: Math.round((fatCalories / totalMacroCalories) * 100),
              }
            : { protein: 0, carbs: 0, fats: 0 },
      };

      this.loggerService.info('Nutrition stats calculated successfully', {
        ...logContext,
        statsGenerated: true,
      });

      return stats;
    } catch (error) {
      this.loggerService.error(
        'Failed to calculate nutrition stats',
        error,
        logContext,
      );
      throw new Error(`Failed to calculate nutrition stats: ${error.message}`);
    }
  }
}
