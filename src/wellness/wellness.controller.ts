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
} from '@nestjs/common';
import { WellnessService } from './wellness.service.js';
import { CreateWellnessSessionDto } from './dto/create-wellness-session.dto.js';
import { UpdateWellnessSessionDto } from './dto/update-wellness-session.dto.js';
import {
  StartSessionDto,
  UpdateSessionProgressDto,
  CompleteSessionDto,
} from './dto/session-progress.dto.js';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard.js';
import {
  SessionType,
  SessionDifficulty,
} from './entities/wellness-session.entity.js';

@Controller('api/wellness')
export class WellnessController {
  constructor(private readonly wellnessService: WellnessService) {}

  // Admin endpoints for managing wellness sessions
  @Post('sessions')
  // @UseGuards(AdminGuard) // You would implement this for admin-only access
  createSession(@Body() createWellnessSessionDto: CreateWellnessSessionDto) {
    return this.wellnessService.createSession(createWellnessSessionDto);
  }

  @Patch('sessions/:id')
  // @UseGuards(AdminGuard)
  updateSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWellnessSessionDto: UpdateWellnessSessionDto,
  ) {
    return this.wellnessService.updateSession(id, updateWellnessSessionDto);
  }

  @Delete('sessions/:id')
  // @UseGuards(AdminGuard)
  deleteSession(@Param('id', ParseIntPipe) id: number) {
    return this.wellnessService.deleteSession(id);
  }

  // User endpoints for accessing wellness sessions
  @Get('sessions')
  findAllSessions(
    @Query('type') type?: SessionType,
    @Query('difficulty') difficulty?: SessionDifficulty,
    @Query('isPremium') isPremium?: boolean,
    @Query('tags') tags?: string,
    @Query('limit') limit?: number,
  ) {
    const tagArray = tags
      ? tags.split(',').map((tag) => tag.trim())
      : undefined;
    return this.wellnessService.findAllSessions(
      type,
      difficulty,
      isPremium,
      tagArray,
      limit,
    );
  }

  @Get('sessions/:id')
  findSession(@Param('id', ParseIntPipe) id: number) {
    return this.wellnessService.findSessionById(id);
  }

  // User session progress endpoints
  @Post('sessions/:id/start')
  @UseGuards(AuthGuard)
  startSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() startDto: StartSessionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.wellnessService.startSession(id, req.user.id, startDto);
  }

  @Patch('sessions/:id/progress')
  @UseGuards(AuthGuard)
  updateProgress(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSessionProgressDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.wellnessService.updateSessionProgress(
      id,
      req.user.id,
      updateDto,
    );
  }

  @Post('sessions/:id/complete')
  @UseGuards(AuthGuard)
  completeSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() completeDto: CompleteSessionDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.wellnessService.completeSession(id, req.user.id, completeDto);
  }

  @Get('sessions/user-progress')
  @UseGuards(AuthGuard)
  getUserProgress(
    @Request() req: AuthenticatedRequest,
    @Query('sessionId') sessionId?: string,
  ) {
    const parsedSessionId = sessionId ? parseInt(sessionId, 10) : undefined;
    return this.wellnessService.getUserSessionProgress(
      req.user.id,
      parsedSessionId,
    );
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  getWellnessStats(@Request() req: AuthenticatedRequest) {
    return this.wellnessService.getWellnessStats(req.user.id);
  }
}
