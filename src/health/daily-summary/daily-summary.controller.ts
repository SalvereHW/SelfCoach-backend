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
import { DailySummaryService } from './daily-summary.service.js';
import { CreateDailySummaryDto } from './dto/create-daily-summary.dto.js';
import { UpdateDailySummaryDto } from './dto/update-daily-summary.dto.js';
import { AuthGuard, AuthenticatedRequest } from '../../auth/auth.guard.js';

@Controller('api/health/daily-summary')
@UseGuards(AuthGuard)
export class DailySummaryController {
  constructor(private readonly dailySummaryService: DailySummaryService) {}

  @Post()
  create(
    @Body() createDailySummaryDto: CreateDailySummaryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dailySummaryService.create(req.user.id, createDailySummaryDto);
  }

  @Post('upsert')
  upsert(
    @Body() createDailySummaryDto: CreateDailySummaryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dailySummaryService.upsert(req.user.id, createDailySummaryDto);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.dailySummaryService.findAll(
      req.user.id,
      startDate,
      endDate,
      limit,
    );
  }

  @Get('stats')
  getStats(@Request() req: AuthenticatedRequest, @Query('days') days?: number) {
    return this.dailySummaryService.getStats(req.user.id, days);
  }

  @Get('date/:date')
  findByDate(
    @Param('date') date: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dailySummaryService.findByDate(req.user.id, date);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dailySummaryService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDailySummaryDto: UpdateDailySummaryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dailySummaryService.update(
      id,
      req.user.id,
      updateDailySummaryDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dailySummaryService.remove(id, req.user.id);
  }
}
