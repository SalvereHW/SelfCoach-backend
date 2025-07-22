import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SleepMetric } from './sleep-metric.entity.js';
import { CreateSleepMetricDto } from './dto/create-sleep-metric.dto.js';
import { UpdateSleepMetricDto } from './dto/update-sleep-metric.dto.js';
import { LoggerService } from '../../common/logging/logger.service.js';

export interface SleepStatsResponse {
  averageDuration: number;
  averageQuality: number;
  totalNights: number;
  averageBedTime: string;
  averageWakeTime: string;
  sleepEfficiency: number;
}

@Injectable()
export class SleepService {
  constructor(
    @InjectRepository(SleepMetric)
    private sleepMetricRepository: Repository<SleepMetric>,
    private readonly loggerService: LoggerService,
  ) {}

  async create(
    userId: number,
    createSleepMetricDto: CreateSleepMetricDto,
  ): Promise<SleepMetric> {
    const logContext = {
      userId,
      endpoint: 'health/sleep/create',
      action: 'create_sleep_metric',
    };

    try {
      // Check if sleep record already exists for this date
      const existingSleep = await this.sleepMetricRepository.findOne({
        where: {
          userId,
          date: new Date(createSleepMetricDto.date),
        },
      });

      if (existingSleep) {
        this.loggerService.warn(
          'Attempted to create sleep metric for existing date',
          logContext,
        );
        throw new BadRequestException(
          'Sleep record already exists for this date',
        );
      }

      const sleepMetric = this.sleepMetricRepository.create({
        ...createSleepMetricDto,
        date: new Date(createSleepMetricDto.date),
        userId,
      });

      const savedSleepMetric =
        await this.sleepMetricRepository.save(sleepMetric);

      this.loggerService.info('Sleep metric created successfully', {
        ...logContext,
        sleepMetricId: savedSleepMetric.id,
      });

      this.loggerService.logDataAccess('create', 'sleep_metric', {
        ...logContext,
        sleepMetricId: savedSleepMetric.id,
      });

      return savedSleepMetric;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.loggerService.error(
        'Failed to create sleep metric',
        error,
        logContext,
      );
      throw new Error(`Failed to create sleep metric: ${error.message}`);
    }
  }

  async findAll(
    userId: number,
    startDate?: string,
    endDate?: string,
    limit?: number,
  ): Promise<SleepMetric[]> {
    const logContext = {
      userId,
      endpoint: 'health/sleep/find-all',
      action: 'fetch_sleep_metrics',
    };

    try {
      const queryBuilder = this.sleepMetricRepository
        .createQueryBuilder('sleep')
        .where('sleep.userId = :userId', { userId })
        .orderBy('sleep.date', 'DESC');

      if (startDate && endDate) {
        queryBuilder.andWhere('sleep.date BETWEEN :startDate AND :endDate', {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        });
      }

      if (limit) {
        queryBuilder.limit(limit);
      }

      const results = await queryBuilder.getMany();

      this.loggerService.info(
        `Retrieved ${results.length} sleep metrics`,
        logContext,
      );

      this.loggerService.logDataAccess('read', 'sleep_metric', {
        ...logContext,
        recordCount: results.length,
      });

      return results;
    } catch (error) {
      this.loggerService.error(
        'Failed to fetch sleep metrics',
        error,
        logContext,
      );
      throw new Error(`Failed to fetch sleep metrics: ${error.message}`);
    }
  }

  async findOne(id: number, userId: number): Promise<SleepMetric> {
    const logContext = {
      userId,
      endpoint: 'health/sleep/find-one',
      action: 'fetch_sleep_metric',
    };

    try {
      const sleepMetric = await this.sleepMetricRepository.findOne({
        where: { id, userId },
      });

      if (!sleepMetric) {
        this.loggerService.warn('Sleep metric not found', {
          ...logContext,
          sleepMetricId: id,
        });
        throw new NotFoundException('Sleep metric not found');
      }

      this.loggerService.info('Sleep metric retrieved successfully', {
        ...logContext,
        sleepMetricId: id,
      });

      this.loggerService.logDataAccess('read', 'sleep_metric', {
        ...logContext,
        sleepMetricId: id,
      });

      return sleepMetric;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to fetch sleep metric', error, {
        ...logContext,
        sleepMetricId: id,
      });
      throw new Error(`Failed to fetch sleep metric: ${error.message}`);
    }
  }

  async update(
    id: number,
    userId: number,
    updateSleepMetricDto: UpdateSleepMetricDto,
  ): Promise<SleepMetric> {
    const logContext = {
      userId,
      endpoint: 'health/sleep/update',
      action: 'update_sleep_metric',
    };

    try {
      const sleepMetric = await this.findOne(id, userId);

      const updateData = {
        ...updateSleepMetricDto,
        date: updateSleepMetricDto.date
          ? new Date(updateSleepMetricDto.date)
          : sleepMetric.date,
      };

      await this.sleepMetricRepository.update(id, updateData);
      const updatedSleepMetric = await this.findOne(id, userId);

      this.loggerService.info('Sleep metric updated successfully', {
        ...logContext,
        sleepMetricId: id,
      });

      this.loggerService.logDataAccess('update', 'sleep_metric', {
        ...logContext,
        sleepMetricId: id,
      });

      return updatedSleepMetric;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to update sleep metric', error, {
        ...logContext,
        sleepMetricId: id,
      });
      throw new Error(`Failed to update sleep metric: ${error.message}`);
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    const logContext = {
      userId,
      endpoint: 'health/sleep/remove',
      action: 'delete_sleep_metric',
    };

    try {
      await this.findOne(id, userId);
      await this.sleepMetricRepository.delete(id);

      this.loggerService.info('Sleep metric deleted successfully', {
        ...logContext,
        sleepMetricId: id,
      });

      this.loggerService.logDataAccess('delete', 'sleep_metric', {
        ...logContext,
        sleepMetricId: id,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.loggerService.error('Failed to delete sleep metric', error, {
        ...logContext,
        sleepMetricId: id,
      });
      throw new Error(`Failed to delete sleep metric: ${error.message}`);
    }
  }

  async getStats(
    userId: number,
    days: number = 30,
  ): Promise<SleepStatsResponse> {
    const logContext = {
      userId,
      endpoint: 'health/sleep/stats',
      action: 'calculate_sleep_stats',
    };

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const sleepMetrics = await this.sleepMetricRepository.find({
        where: {
          userId,
          date: Between(startDate, endDate),
        },
      });

      this.loggerService.info('Sleep stats calculation initiated', {
        ...logContext,
        daysRequested: days,
        recordsFound: sleepMetrics.length,
      });

      this.loggerService.logDataAccess('read', 'sleep_metric_stats', {
        ...logContext,
        recordCount: sleepMetrics.length,
      });

      if (sleepMetrics.length === 0) {
        this.loggerService.warn(
          'No sleep data found for stats calculation',
          logContext,
        );
        return {
          averageDuration: 0,
          averageQuality: 0,
          totalNights: 0,
          averageBedTime: '00:00',
          averageWakeTime: '00:00',
          sleepEfficiency: 0,
        };
      }

      const validDurations = sleepMetrics
        .filter((s) => s.duration)
        .map((s) => s.duration);
      const validQualities = sleepMetrics
        .filter((s) => s.quality)
        .map((s) => s.qualityScore);
      const validBedTimes = sleepMetrics
        .filter((s) => s.bedTime)
        .map((s) => s.bedTime);
      const validWakeTimes = sleepMetrics
        .filter((s) => s.wakeTime)
        .map((s) => s.wakeTime);
      const validEfficiencies = sleepMetrics
        .filter((s) => s.sleepEfficiency)
        .map((s) => s.sleepEfficiency);

      const stats = {
        averageDuration:
          validDurations.length > 0
            ? Math.round(
                validDurations.reduce((a, b) => a + b, 0) /
                  validDurations.length,
              )
            : 0,
        averageQuality:
          validQualities.length > 0
            ? Math.round(
                (validQualities.reduce((a, b) => a + b, 0) /
                  validQualities.length) *
                  100,
              ) / 100
            : 0,
        totalNights: sleepMetrics.length,
        averageBedTime: this.calculateAverageTime(validBedTimes),
        averageWakeTime: this.calculateAverageTime(validWakeTimes),
        sleepEfficiency:
          validEfficiencies.length > 0
            ? Math.round(
                validEfficiencies.reduce((a, b) => a + b, 0) /
                  validEfficiencies.length,
              )
            : 0,
      };

      this.loggerService.info('Sleep stats calculated successfully', {
        ...logContext,
        statsGenerated: true,
      });

      return stats;
    } catch (error) {
      this.loggerService.error(
        'Failed to calculate sleep stats',
        error,
        logContext,
      );
      throw new Error(`Failed to calculate sleep stats: ${error.message}`);
    }
  }

  private calculateAverageTime(times: string[]): string {
    if (times.length === 0) return '00:00';

    const totalMinutes = times.reduce((total, time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return total + hours * 60 + minutes;
    }, 0);

    const averageMinutes = Math.round(totalMinutes / times.length);
    const hours = Math.floor(averageMinutes / 60);
    const minutes = averageMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }
}
