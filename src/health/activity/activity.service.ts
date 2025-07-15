import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ActivityMetric, ActivityType, ActivityIntensity } from './activity-metric.entity.js';
import { CreateActivityMetricDto } from './dto/create-activity-metric.dto.js';
import { UpdateActivityMetricDto } from './dto/update-activity-metric.dto.js';
import { LoggerService } from '../../common/logging/logger.service.js';

export interface ActivityStatsResponse {
  totalActivities: number;
  totalDuration: number; // in minutes
  totalCaloriesBurned: number;
  totalDistance: number;
  totalSteps: number;
  averageDuration: number;
  averageIntensity: number;
  averageHeartRate: number;
  activityTypeBreakdown: {
    [key in ActivityType]: {
      count: number;
      totalDuration: number;
      totalCalories: number;
    };
  };
  weeklyProgress: {
    week: string;
    totalDuration: number;
    totalActivities: number;
  }[];
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityMetric)
    private activityMetricRepository: Repository<ActivityMetric>,
    private readonly loggerService: LoggerService,
  ) {}

  async create(userId: number, createActivityMetricDto: CreateActivityMetricDto): Promise<ActivityMetric> {
    const logContext = {
      userId,
      endpoint: 'health/activity/create',
      action: 'create_activity_metric'
    };

    try {
      const activityMetric = this.activityMetricRepository.create({
        ...createActivityMetricDto,
        date: new Date(createActivityMetricDto.date),
        userId,
      });

      const savedActivityMetric = await this.activityMetricRepository.save(activityMetric);
      
      this.loggerService.info('Activity metric created successfully', {
        ...logContext,
        activityMetricId: savedActivityMetric.id,
        activityType: savedActivityMetric.activityType
      });
      
      this.loggerService.logDataAccess('create', 'activity_metric', {
        ...logContext,
        activityMetricId: savedActivityMetric.id
      });

      return savedActivityMetric;
    } catch (error) {
      this.loggerService.error('Failed to create activity metric', error, logContext);
      throw new Error(`Failed to create activity metric: ${error.message}`);
    }
  }

  async findAll(
    userId: number,
    startDate?: string,
    endDate?: string,
    activityType?: ActivityType,
    limit?: number
  ): Promise<ActivityMetric[]> {
    const logContext = {
      userId,
      endpoint: 'health/activity/find-all',
      action: 'fetch_activity_metrics'
    };

    try {
      const queryBuilder = this.activityMetricRepository
        .createQueryBuilder('activity')
        .where('activity.userId = :userId', { userId })
        .orderBy('activity.date', 'DESC')
        .addOrderBy('activity.createdAt', 'DESC');

      if (startDate && endDate) {
        queryBuilder.andWhere('activity.date BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        });
      }

      if (activityType) {
        queryBuilder.andWhere('activity.activityType = :activityType', { activityType });
      }

      if (limit) {
        queryBuilder.limit(limit);
      }

      const results = await queryBuilder.getMany();
      
      this.loggerService.info(`Retrieved ${results.length} activity metrics`, {
        ...logContext,
        activityType: activityType || 'all'
      });
      
      this.loggerService.logDataAccess('read', 'activity_metric', {
        ...logContext,
        recordCount: results.length
      });

      return results;
    } catch (error) {
      this.loggerService.error('Failed to fetch activity metrics', error, logContext);
      throw new Error(`Failed to fetch activity metrics: ${error.message}`);
    }
  }

  async findOne(id: number, userId: number): Promise<ActivityMetric> {
    const logContext = {
      userId,
      endpoint: 'health/activity/find-one',
      action: 'fetch_activity_metric'
    };

    try {
      const activityMetric = await this.activityMetricRepository.findOne({
        where: { id, userId }
      });

      if (!activityMetric) {
        this.loggerService.warn('Activity metric not found', {
          ...logContext,
          activityMetricId: id
        });
        throw new NotFoundException('Activity metric not found');
      }

      this.loggerService.info('Activity metric retrieved successfully', {
        ...logContext,
        activityMetricId: id
      });
      
      this.loggerService.logDataAccess('read', 'activity_metric', {
        ...logContext,
        activityMetricId: id
      });

      return activityMetric;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to fetch activity metric', error, {
        ...logContext,
        activityMetricId: id
      });
      throw new Error(`Failed to fetch activity metric: ${error.message}`);
    }
  }

  async update(id: number, userId: number, updateActivityMetricDto: UpdateActivityMetricDto): Promise<ActivityMetric> {
    const logContext = {
      userId,
      endpoint: 'health/activity/update',
      action: 'update_activity_metric'
    };

    try {
      const activityMetric = await this.findOne(id, userId);

      const updateData = {
        ...updateActivityMetricDto,
        date: updateActivityMetricDto.date ? new Date(updateActivityMetricDto.date) : activityMetric.date,
      };

      await this.activityMetricRepository.update(id, updateData);
      const updatedActivityMetric = await this.findOne(id, userId);
      
      this.loggerService.info('Activity metric updated successfully', {
        ...logContext,
        activityMetricId: id
      });
      
      this.loggerService.logDataAccess('update', 'activity_metric', {
        ...logContext,
        activityMetricId: id
      });

      return updatedActivityMetric;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to update activity metric', error, {
        ...logContext,
        activityMetricId: id
      });
      throw new Error(`Failed to update activity metric: ${error.message}`);
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    const logContext = {
      userId,
      endpoint: 'health/activity/remove',
      action: 'delete_activity_metric'
    };

    try {
      const activityMetric = await this.findOne(id, userId);
      await this.activityMetricRepository.delete(id);
      
      this.loggerService.info('Activity metric deleted successfully', {
        ...logContext,
        activityMetricId: id
      });
      
      this.loggerService.logDataAccess('delete', 'activity_metric', {
        ...logContext,
        activityMetricId: id
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to delete activity metric', error, {
        ...logContext,
        activityMetricId: id
      });
      throw new Error(`Failed to delete activity metric: ${error.message}`);
    }
  }

  async getStats(userId: number, days: number = 30): Promise<ActivityStatsResponse> {
    const logContext = {
      userId,
      endpoint: 'health/activity/stats',
      action: 'calculate_activity_stats'
    };

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const activityMetrics = await this.activityMetricRepository.find({
        where: {
          userId,
          date: Between(startDate, endDate)
        }
      });

      this.loggerService.info('Activity stats calculation initiated', {
        ...logContext,
        daysRequested: days,
        recordsFound: activityMetrics.length
      });
      
      this.loggerService.logDataAccess('read', 'activity_metric_stats', {
        ...logContext,
        recordCount: activityMetrics.length
      });

      if (activityMetrics.length === 0) {
        this.loggerService.warn('No activity data found for stats calculation', logContext);
        return this.getEmptyStats();
      }

      // Calculate basic totals
      const totalActivities = activityMetrics.length;
      const totalDuration = activityMetrics.reduce((sum, activity) => sum + activity.duration, 0);
      const totalCaloriesBurned = activityMetrics.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);
      const totalDistance = activityMetrics.reduce((sum, activity) => sum + (activity.distance || 0), 0);
      const totalSteps = activityMetrics.reduce((sum, activity) => sum + (activity.steps || 0), 0);

      // Calculate averages
      const averageDuration = Math.round(totalDuration / totalActivities);
      const intensityScores = activityMetrics.map(a => a.intensityScore);
      const averageIntensity = Math.round((intensityScores.reduce((a, b) => a + b, 0) / intensityScores.length) * 100) / 100;
      
      const heartRates = activityMetrics.filter(a => a.averageHeartRate).map(a => a.averageHeartRate!);
      const averageHeartRate = heartRates.length > 0 
        ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
        : 0;

      // Activity type breakdown
      const activityTypeBreakdown = this.calculateActivityTypeBreakdown(activityMetrics);

      // Weekly progress
      const weeklyProgress = this.calculateWeeklyProgress(activityMetrics, startDate, endDate);

      const stats = {
        totalActivities,
        totalDuration,
        totalCaloriesBurned: Math.round(totalCaloriesBurned),
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalSteps,
        averageDuration,
        averageIntensity,
        averageHeartRate,
        activityTypeBreakdown,
        weeklyProgress
      };

      this.loggerService.info('Activity stats calculated successfully', {
        ...logContext,
        statsGenerated: true
      });

      return stats;
    } catch (error) {
      this.loggerService.error('Failed to calculate activity stats', error, logContext);
      throw new Error(`Failed to calculate activity stats: ${error.message}`);
    }
  }

  private getEmptyStats(): ActivityStatsResponse {
    const emptyActivityBreakdown = {} as any;
    Object.values(ActivityType).forEach(type => {
      emptyActivityBreakdown[type] = { count: 0, totalDuration: 0, totalCalories: 0 };
    });

    return {
      totalActivities: 0,
      totalDuration: 0,
      totalCaloriesBurned: 0,
      totalDistance: 0,
      totalSteps: 0,
      averageDuration: 0,
      averageIntensity: 0,
      averageHeartRate: 0,
      activityTypeBreakdown: emptyActivityBreakdown,
      weeklyProgress: []
    };
  }

  private calculateActivityTypeBreakdown(activities: ActivityMetric[]) {
    const breakdown = {} as any;
    
    // Initialize all activity types
    Object.values(ActivityType).forEach(type => {
      breakdown[type] = { count: 0, totalDuration: 0, totalCalories: 0 };
    });

    // Calculate breakdowns
    activities.forEach(activity => {
      breakdown[activity.activityType].count += 1;
      breakdown[activity.activityType].totalDuration += activity.duration;
      breakdown[activity.activityType].totalCalories += activity.caloriesBurned || 0;
    });

    return breakdown;
  }

  private calculateWeeklyProgress(activities: ActivityMetric[], startDate: Date, endDate: Date) {
    const weeks = new Map<string, { totalDuration: number; totalActivities: number }>();
    
    activities.forEach(activity => {
      const weekStart = this.getWeekStart(activity.date);
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, { totalDuration: 0, totalActivities: 0 });
      }
      
      const week = weeks.get(weekKey)!;
      week.totalDuration += activity.duration;
      week.totalActivities += 1;
    });

    return Array.from(weeks.entries()).map(([week, data]) => ({
      week,
      totalDuration: data.totalDuration,
      totalActivities: data.totalActivities
    })).sort((a, b) => a.week.localeCompare(b.week));
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }
}