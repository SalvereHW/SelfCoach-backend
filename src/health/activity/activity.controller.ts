import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivityService } from './activity.service.js';
import { CreateActivityMetricDto } from './dto/create-activity-metric.dto.js';
import { UpdateActivityMetricDto } from './dto/update-activity-metric.dto.js';
import { AuthGuard, AuthenticatedRequest } from '../../auth/auth.guard.js';
import { ActivityType } from './activity-metric.entity.js';

@Controller('api/health/activity')
@UseGuards(AuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  create(
    @Body() createActivityMetricDto: CreateActivityMetricDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.activityService.create(req.user.id, createActivityMetricDto);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('activityType') activityType?: ActivityType,
    @Query('limit') limit?: number,
  ) {
    return this.activityService.findAll(
      req.user.id,
      startDate,
      endDate,
      activityType,
      limit,
    );
  }

  @Get('stats')
  getStats(@Request() req: AuthenticatedRequest, @Query('days') days?: number) {
    return this.activityService.getStats(req.user.id, days);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.activityService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActivityMetricDto: UpdateActivityMetricDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.activityService.update(
      id,
      req.user.id,
      updateActivityMetricDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.activityService.remove(id, req.user.id);
  }
}
