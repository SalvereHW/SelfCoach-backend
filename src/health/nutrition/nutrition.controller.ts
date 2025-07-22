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
import { NutritionService } from './nutrition.service.js';
import { CreateNutritionMetricDto } from './dto/create-nutrition-metric.dto.js';
import { UpdateNutritionMetricDto } from './dto/update-nutrition-metric.dto.js';
import { AuthGuard, AuthenticatedRequest } from '../../auth/auth.guard.js';
import { MealType } from './nutrition-metric.entity.js';

@Controller('api/health/nutrition')
@UseGuards(AuthGuard)
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post()
  create(
    @Body() createNutritionMetricDto: CreateNutritionMetricDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.nutritionService.create(req.user.id, createNutritionMetricDto);
  }

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('mealType') mealType?: MealType,
    @Query('limit') limit?: number,
  ) {
    return this.nutritionService.findAll(
      req.user.id,
      startDate,
      endDate,
      mealType,
      limit,
    );
  }

  @Get('daily/:date')
  getDailySummary(
    @Param('date') date: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.nutritionService.getDailySummary(req.user.id, date);
  }

  @Get('stats')
  getStats(@Request() req: AuthenticatedRequest, @Query('days') days?: number) {
    return this.nutritionService.getStats(req.user.id, days);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.nutritionService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNutritionMetricDto: UpdateNutritionMetricDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.nutritionService.update(
      id,
      req.user.id,
      updateNutritionMetricDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.nutritionService.remove(id, req.user.id);
  }
}
