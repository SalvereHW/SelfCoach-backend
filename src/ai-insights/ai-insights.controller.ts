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
import { CreateAiInsightDto } from './dto/create-ai-insight.dto.js';
import { UpdateAiInsightDto } from './dto/update-ai-insight.dto.js';
import { GenerateInsightDto } from './dto/generate-insight.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { InsightType } from './entities/ai-insight.entity.js';

@Controller('ai-insights')
@UseGuards(AuthGuard)
export class AiInsightsController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  @Post()
  create(@Request() req, @Body() createAiInsightDto: CreateAiInsightDto) {
    return this.aiInsightsService.create(req.user.sub, createAiInsightDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('limit', ParseIntPipe) limit: number = 50,
  ) {
    return this.aiInsightsService.findAll(req.user.sub, limit);
  }

  @Get('unread')
  findUnread(@Request() req) {
    return this.aiInsightsService.getUnreadInsights(req.user.sub);
  }

  @Get('type/:type')
  findByType(
    @Request() req,
    @Param('type') type: InsightType,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.aiInsightsService.getInsightsByType(req.user.sub, type, limit);
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  generate(@Request() req, @Body() generateDto: GenerateInsightDto) {
    return this.aiInsightsService.generateInsight(req.user.sub, generateDto);
  }

  @Get('generation-status')
  checkGenerationLimit(@Request() req) {
    return this.aiInsightsService.checkGenerationLimit(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.aiInsightsService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAiInsightDto: UpdateAiInsightDto,
  ) {
    return this.aiInsightsService.update(req.user.sub, id, updateAiInsightDto);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.aiInsightsService.markAsRead(req.user.sub, id);
  }

  @Patch(':id/dismiss')
  @HttpCode(HttpStatus.OK)
  markAsDismissed(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.aiInsightsService.markAsDismissed(req.user.sub, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.aiInsightsService.remove(req.user.sub, id);
  }
}