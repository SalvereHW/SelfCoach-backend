import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailySummary } from './daily-summary.entity.js';
import { CreateDailySummaryDto } from './dto/create-daily-summary.dto.js';
import { UpdateDailySummaryDto } from './dto/update-daily-summary.dto.js';
import { LoggerService } from '../../common/logging/logger.service.js';

export interface WellnessStatsResponse {
  averageMood: number;
  averageStress: number;
  averageEnergy: number;
  averageWellnessScore: number;
  totalDays: number;
  mostCommonSymptoms: string[];
  averageWeight: number;
  weightTrend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  bloodPressureTrend: {
    averageSystolic: number;
    averageDiastolic: number;
    category: string;
  };
  moodTrend: {
    week: string;
    averageMood: number;
  }[];
}

@Injectable()
export class DailySummaryService {
  constructor(
    @InjectRepository(DailySummary)
    private dailySummaryRepository: Repository<DailySummary>,
    private readonly loggerService: LoggerService,
  ) {}

  async create(
    userId: number,
    createDailySummaryDto: CreateDailySummaryDto,
  ): Promise<DailySummary> {
    const logContext = {
      userId,
      endpoint: 'health/daily-summary/create',
      action: 'create_daily_summary',
    };

    try {
      // Check if summary already exists for this date
      const existingSummary = await this.dailySummaryRepository.findOne({
        where: {
          userId,
          date: new Date(createDailySummaryDto.date),
        },
      });

      if (existingSummary) {
        this.loggerService.warn(
          'Attempted to create daily summary for existing date',
          logContext,
        );
        throw new BadRequestException(
          'Daily summary already exists for this date',
        );
      }

      const dailySummary = this.dailySummaryRepository.create({
        ...createDailySummaryDto,
        date: new Date(createDailySummaryDto.date),
        userId,
      });

      const savedDailySummary =
        await this.dailySummaryRepository.save(dailySummary);

      this.loggerService.info('Daily summary created successfully', {
        ...logContext,
        dailySummaryId: savedDailySummary.id,
      });

      this.loggerService.logDataAccess('create', 'daily_summary', {
        ...logContext,
        dailySummaryId: savedDailySummary.id,
      });

      return savedDailySummary;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.loggerService.error(
        'Failed to create daily summary',
        error,
        logContext,
      );
      throw new Error(`Failed to create daily summary: ${error.message}`);
    }
  }

  async findAll(
    userId: number,
    startDate?: string,
    endDate?: string,
    limit?: number,
  ): Promise<DailySummary[]> {
    const logContext = {
      userId,
      endpoint: 'health/daily-summary/find-all',
      action: 'fetch_daily_summaries',
    };

    try {
      const queryBuilder = this.dailySummaryRepository
        .createQueryBuilder('summary')
        .where('summary.userId = :userId', { userId })
        .orderBy('summary.date', 'DESC');

      if (startDate && endDate) {
        queryBuilder.andWhere('summary.date BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
      }

      if (limit) {
        queryBuilder.limit(limit);
      }

      const results = await queryBuilder.getMany();

      this.loggerService.info(
        `Retrieved ${results.length} daily summaries`,
        logContext,
      );

      this.loggerService.logDataAccess('read', 'daily_summary', {
        ...logContext,
        recordCount: results.length,
      });

      return results;
    } catch (error) {
      this.loggerService.error(
        'Failed to fetch daily summaries',
        error,
        logContext,
      );
      throw new Error(`Failed to fetch daily summaries: ${error.message}`);
    }
  }

  async findByDate(userId: number, date: string): Promise<DailySummary | null> {
    const logContext = {
      userId,
      endpoint: 'health/daily-summary/find-by-date',
      action: 'fetch_daily_summary_by_date',
    };

    try {
      const result = await this.dailySummaryRepository.findOne({
        where: {
          userId,
          date: new Date(date),
        },
      });

      this.loggerService.info('Daily summary by date lookup completed', {
        ...logContext,
        date: date,
        found: !!result,
      });

      if (result) {
        this.loggerService.logDataAccess('read', 'daily_summary', {
          ...logContext,
          dailySummaryId: result.id,
        });
      }

      return result;
    } catch (error) {
      this.loggerService.error(
        'Failed to fetch daily summary by date',
        error,
        logContext,
      );
      throw new Error(`Failed to fetch daily summary: ${error.message}`);
    }
  }

  async findOne(id: number, userId: number): Promise<DailySummary> {
    const logContext = {
      userId,
      endpoint: 'health/daily-summary/find-one',
      action: 'fetch_daily_summary',
    };

    try {
      const dailySummary = await this.dailySummaryRepository.findOne({
        where: { id, userId },
      });

      if (!dailySummary) {
        this.loggerService.warn('Daily summary not found', {
          ...logContext,
          dailySummaryId: id,
        });
        throw new NotFoundException('Daily summary not found');
      }

      this.loggerService.info('Daily summary retrieved successfully', {
        ...logContext,
        dailySummaryId: id,
      });

      this.loggerService.logDataAccess('read', 'daily_summary', {
        ...logContext,
        dailySummaryId: id,
      });

      return dailySummary;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to fetch daily summary', error, {
        ...logContext,
        dailySummaryId: id,
      });
      throw new Error(`Failed to fetch daily summary: ${error.message}`);
    }
  }

  async update(
    id: number,
    userId: number,
    updateDailySummaryDto: UpdateDailySummaryDto,
  ): Promise<DailySummary> {
    const logContext = {
      userId,
      endpoint: 'health/daily-summary/update',
      action: 'update_daily_summary',
    };

    try {
      const dailySummary = await this.findOne(id, userId);

      const updateData = {
        ...updateDailySummaryDto,
        date: updateDailySummaryDto.date
          ? new Date(updateDailySummaryDto.date)
          : dailySummary.date,
      };

      await this.dailySummaryRepository.update(id, updateData);
      const updatedDailySummary = await this.findOne(id, userId);

      this.loggerService.info('Daily summary updated successfully', {
        ...logContext,
        dailySummaryId: id,
      });

      this.loggerService.logDataAccess('update', 'daily_summary', {
        ...logContext,
        dailySummaryId: id,
      });

      return updatedDailySummary;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to update daily summary', error, {
        ...logContext,
        dailySummaryId: id,
      });
      throw new Error(`Failed to update daily summary: ${error.message}`);
    }
  }

  async upsert(
    userId: number,
    createOrUpdateDto: CreateDailySummaryDto,
  ): Promise<DailySummary> {
    const logContext = {
      userId,
      endpoint: 'health/daily-summary/upsert',
      action: 'upsert_daily_summary',
    };

    try {
      const existingSummary = await this.findByDate(
        userId,
        createOrUpdateDto.date,
      );

      if (existingSummary) {
        this.loggerService.info('Existing daily summary found, updating', {
          ...logContext,
          dailySummaryId: existingSummary.id,
        });
        return await this.update(existingSummary.id, userId, createOrUpdateDto);
      } else {
        this.loggerService.info(
          'No existing daily summary found, creating new',
          logContext,
        );
        return await this.create(userId, createOrUpdateDto);
      }
    } catch (error) {
      this.loggerService.error(
        'Failed to upsert daily summary',
        error,
        logContext,
      );
      throw new Error(`Failed to upsert daily summary: ${error.message}`);
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    const logContext = {
      userId,
      endpoint: 'health/daily-summary/remove',
      action: 'delete_daily_summary',
    };

    try {
      await this.findOne(id, userId);
      await this.dailySummaryRepository.delete(id);

      this.loggerService.info('Daily summary deleted successfully', {
        ...logContext,
        dailySummaryId: id,
      });

      this.loggerService.logDataAccess('delete', 'daily_summary', {
        ...logContext,
        dailySummaryId: id,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to delete daily summary', error, {
        ...logContext,
        dailySummaryId: id,
      });
      throw new Error(`Failed to delete daily summary: ${error.message}`);
    }
  }

  async getStats(
    userId: number,
    days: number = 30,
  ): Promise<WellnessStatsResponse> {
    const logContext = {
      userId,
      endpoint: 'health/daily-summary/stats',
      action: 'calculate_wellness_stats',
    };

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const summaries = await this.dailySummaryRepository.find({
        where: {
          userId,
          date: Between(startDate, endDate),
        },
        order: { date: 'ASC' },
      });

      this.loggerService.info('Wellness stats calculation initiated', {
        ...logContext,
        daysRequested: days,
        recordsFound: summaries.length,
      });

      this.loggerService.logDataAccess('read', 'daily_summary_stats', {
        ...logContext,
        recordCount: summaries.length,
      });

      if (summaries.length === 0) {
        this.loggerService.warn(
          'No wellness data found for stats calculation',
          logContext,
        );
        return this.getEmptyStats();
      }

      // Calculate averages
      const validMoods = summaries
        .filter((s) => s.mood !== null && s.mood !== undefined)
        .map((s) => s.mood!);
      const validStress = summaries
        .filter((s) => s.stressLevel !== null && s.stressLevel !== undefined)
        .map((s) => s.stressLevel!);
      const validEnergy = summaries
        .filter((s) => s.energyLevel !== null && s.energyLevel !== undefined)
        .map((s) => s.energyLevel!);
      const validWellnessScores = summaries
        .filter((s) => s.wellnessScore !== null)
        .map((s) => s.wellnessScore!);
      const validWeights = summaries
        .filter((s) => s.weight !== null && s.weight !== undefined)
        .map((s) => s.weight!);

      // Blood pressure calculations
      const validBP = summaries.filter(
        (s) => s.bloodPressureSystolic && s.bloodPressureDiastolic,
      );
      const avgSystolic =
        validBP.length > 0
          ? Math.round(
              validBP.reduce((sum, s) => sum + s.bloodPressureSystolic!, 0) /
                validBP.length,
            )
          : 0;
      const avgDiastolic =
        validBP.length > 0
          ? Math.round(
              validBP.reduce((sum, s) => sum + s.bloodPressureDiastolic!, 0) /
                validBP.length,
            )
          : 0;

      // Symptom analysis
      const allSymptoms = summaries.flatMap((s) => s.symptoms || []);
      const symptomCounts = allSymptoms.reduce(
        (counts, symptom) => {
          counts[symptom] = (counts[symptom] || 0) + 1;
          return counts;
        },
        {} as Record<string, number>,
      );

      const mostCommonSymptoms = Object.entries(symptomCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([symptom]) => symptom);

      // Weight trend
      const weightTrend = this.calculateWeightTrend(validWeights);

      // Mood trend by week
      const moodTrend = this.calculateMoodTrend(summaries);

      // Blood pressure category
      let bpCategory = 'Unknown';
      if (avgSystolic > 0 && avgDiastolic > 0) {
        if (avgSystolic < 120 && avgDiastolic < 80) bpCategory = 'Normal';
        else if (avgSystolic < 130 && avgDiastolic < 80)
          bpCategory = 'Elevated';
        else if (
          (avgSystolic >= 130 && avgSystolic < 140) ||
          (avgDiastolic >= 80 && avgDiastolic < 90)
        )
          bpCategory = 'Stage 1 Hypertension';
        else if (avgSystolic >= 140 || avgDiastolic >= 90)
          bpCategory = 'Stage 2 Hypertension';
        else if (avgSystolic > 180 || avgDiastolic > 120)
          bpCategory = 'Hypertensive Crisis';
      }

      const stats = {
        averageMood:
          validMoods.length > 0
            ? Math.round(
                (validMoods.reduce((a, b) => a + b, 0) / validMoods.length) *
                  100,
              ) / 100
            : 0,
        averageStress:
          validStress.length > 0
            ? Math.round(
                (validStress.reduce((a, b) => a + b, 0) / validStress.length) *
                  100,
              ) / 100
            : 0,
        averageEnergy:
          validEnergy.length > 0
            ? Math.round(
                (validEnergy.reduce((a, b) => a + b, 0) / validEnergy.length) *
                  100,
              ) / 100
            : 0,
        averageWellnessScore:
          validWellnessScores.length > 0
            ? Math.round(
                (validWellnessScores.reduce((a, b) => a + b, 0) /
                  validWellnessScores.length) *
                  100,
              ) / 100
            : 0,
        totalDays: summaries.length,
        mostCommonSymptoms,
        averageWeight:
          validWeights.length > 0
            ? Math.round(
                (validWeights.reduce((a, b) => a + b, 0) /
                  validWeights.length) *
                  100,
              ) / 100
            : 0,
        weightTrend,
        bloodPressureTrend: {
          averageSystolic: avgSystolic,
          averageDiastolic: avgDiastolic,
          category: bpCategory,
        },
        moodTrend,
      };

      this.loggerService.info('Wellness stats calculated successfully', {
        ...logContext,
        statsGenerated: true,
      });

      return stats;
    } catch (error) {
      this.loggerService.error(
        'Failed to calculate wellness stats',
        error,
        logContext,
      );
      throw new Error(`Failed to calculate wellness stats: ${error.message}`);
    }
  }

  private getEmptyStats(): WellnessStatsResponse {
    return {
      averageMood: 0,
      averageStress: 0,
      averageEnergy: 0,
      averageWellnessScore: 0,
      totalDays: 0,
      mostCommonSymptoms: [],
      averageWeight: 0,
      weightTrend: 'insufficient_data',
      bloodPressureTrend: {
        averageSystolic: 0,
        averageDiastolic: 0,
        category: 'Unknown',
      },
      moodTrend: [],
    };
  }

  private calculateWeightTrend(
    weights: number[],
  ): 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' {
    if (weights.length < 3) return 'insufficient_data';

    const firstHalf = weights.slice(0, Math.floor(weights.length / 2));
    const secondHalf = weights.slice(Math.floor(weights.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const difference = Math.abs(secondAvg - firstAvg);
    const threshold = firstAvg * 0.02; // 2% threshold

    if (difference < threshold) return 'stable';
    return secondAvg > firstAvg ? 'increasing' : 'decreasing';
  }

  private calculateMoodTrend(summaries: DailySummary[]) {
    const weeks = new Map<string, { moods: number[]; count: number }>();

    summaries.forEach((summary) => {
      if (summary.mood !== null && summary.mood !== undefined) {
        const weekStart = this.getWeekStart(summary.date);
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeks.has(weekKey)) {
          weeks.set(weekKey, { moods: [], count: 0 });
        }

        weeks.get(weekKey)!.moods.push(summary.mood);
        weeks.get(weekKey)!.count += 1;
      }
    });

    return Array.from(weeks.entries())
      .map(([week, data]) => ({
        week,
        averageMood:
          Math.round(
            (data.moods.reduce((a, b) => a + b, 0) / data.moods.length) * 100,
          ) / 100,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }
}
