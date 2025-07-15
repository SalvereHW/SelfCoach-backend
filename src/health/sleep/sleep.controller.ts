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
import { SleepService } from './sleep.service.js';
import { CreateSleepMetricDto } from './dto/create-sleep-metric.dto.js';
import { UpdateSleepMetricDto } from './dto/update-sleep-metric.dto.js';
import { AuthGuard, AuthenticatedRequest } from '../../auth/auth.guard.js';

@Controller('api/health/sleep')
@UseGuards(AuthGuard)
export class SleepController {
  constructor(private readonly sleepService: SleepService) {}

  @Post()
  create(
    @Body() createSleepMetricDto: CreateSleepMetricDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.sleepService.create(req.user.id, createSleepMetricDto);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number
  ) {
    return this.sleepService.findAll(req.user.id, startDate, endDate, limit);
  }

  @Get('stats')
  getStats(
    @Request() req: AuthenticatedRequest,
    @Query('days') days?: number
  ) {
    return this.sleepService.getStats(req.user.id, days);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest
  ) {
    return this.sleepService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSleepMetricDto: UpdateSleepMetricDto,
    @Request() req: AuthenticatedRequest
  ) {
    return this.sleepService.update(id, req.user.id, updateSleepMetricDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest
  ) {
    return this.sleepService.remove(id, req.user.id);
  }
}