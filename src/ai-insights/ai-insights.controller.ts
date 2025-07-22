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
import { AiInsightsService } from './ai-insights.service.js';
import { GenerationLimitCheck } from './types/ai-insights.types.js';
import { CreateAiInsightDto } from './dto/create-ai-insight.dto.js';
import { UpdateAiInsightDto } from './dto/update-ai-insight.dto.js';
import { GenerateInsightDto } from './dto/generate-insight.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { InsightType } from './entities/ai-insight.entity.js';

@Controller('api/ai-insights')
@UseGuards(AuthGuard)
export class AiInsightsController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  @Post()
  create(@Request() req, @Body() createAiInsightDto: CreateAiInsightDto) {
    return this.aiInsightsService.create(req.user.id, createAiInsightDto);
  }

  @Get()
  findAll(@Request() req, @Query('limit', ParseIntPipe) limit: number = 50) {
    return this.aiInsightsService.findAll(req.user.id, limit);
  }

  @Get('unread')
  findUnread(@Request() req) {
    return this.aiInsightsService.getUnreadInsights(req.user.id);
  }

  @Get('type/:type')
  findByType(
    @Request() req,
    @Param('type') type: InsightType,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.aiInsightsService.getInsightsByType(req.user.id, type, limit);
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  generate(@Request() req, @Body() generateDto: GenerateInsightDto) {
    return this.aiInsightsService.generateInsight(req.user.id, generateDto);
  }

  @Get('generation-status')
  checkGeneration(@Request() req): Promise<GenerationLimitCheck> {
    return this.aiInsightsService.checkGenerationLimit(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.aiInsightsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAiInsightDto: UpdateAiInsightDto,
  ) {
    return this.aiInsightsService.update(req.user.id, id, updateAiInsightDto);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.aiInsightsService.markAsRead(req.user.id, id);
  }

  @Patch(':id/dismiss')
  @HttpCode(HttpStatus.OK)
  markAsDismissed(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.aiInsightsService.markAsDismissed(req.user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.aiInsightsService.remove(req.user.id, id);
  }
}
