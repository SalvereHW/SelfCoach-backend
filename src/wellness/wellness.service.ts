import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WellnessSession, SessionType, SessionDifficulty } from './entities/wellness-session.entity.js';
import { SessionProgress, SessionStatus } from './entities/session-progress.entity.js';
import { CreateWellnessSessionDto } from './dto/create-wellness-session.dto.js';
import { UpdateWellnessSessionDto } from './dto/update-wellness-session.dto.js';
import { StartSessionDto, UpdateSessionProgressDto, CompleteSessionDto } from './dto/session-progress.dto.js';

export interface WellnessStatsResponse {
  totalSessions: number;
  completedSessions: number;
  totalTimeSpent: number; // in minutes
  averageSessionTime: number; // in minutes
  completionRate: number;
  favoriteType: SessionType | null;
  streak: number; // consecutive days with completed sessions
  typeBreakdown: {
    [key: string]: {
      count: number;
      totalTime: number;
      averageRating: number;
    };
  };
  recentSessions: SessionProgress[];
}

@Injectable()
export class WellnessService {
  constructor(
    @InjectRepository(WellnessSession)
    private wellnessSessionRepository: Repository<WellnessSession>,
    @InjectRepository(SessionProgress)
    private sessionProgressRepository: Repository<SessionProgress>,
  ) {}

  // Admin methods for managing wellness sessions
  async createSession(createWellnessSessionDto: CreateWellnessSessionDto): Promise<WellnessSession> {
    try {
      const session = this.wellnessSessionRepository.create(createWellnessSessionDto);
      return await this.wellnessSessionRepository.save(session);
    } catch (error) {
      throw new Error(`Failed to create wellness session: ${error.message}`);
    }
  }

  async updateSession(id: number, updateWellnessSessionDto: UpdateWellnessSessionDto): Promise<WellnessSession> {
    try {
      const session = await this.findSessionById(id);
      await this.wellnessSessionRepository.update(id, updateWellnessSessionDto);
      return await this.findSessionById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update wellness session: ${error.message}`);
    }
  }

  async deleteSession(id: number): Promise<void> {
    try {
      const session = await this.findSessionById(id);
      await this.wellnessSessionRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete wellness session: ${error.message}`);
    }
  }

  // User methods for accessing and using wellness sessions
  async findAllSessions(
    type?: SessionType,
    difficulty?: SessionDifficulty,
    isPremium?: boolean,
    tags?: string[],
    limit?: number
  ): Promise<WellnessSession[]> {
    try {
      const queryBuilder = this.wellnessSessionRepository
        .createQueryBuilder('session')
        .where('session.isActive = :isActive', { isActive: true })
        .orderBy('session.averageRating', 'DESC')
        .addOrderBy('session.totalSessions', 'DESC');

      if (type) {
        queryBuilder.andWhere('session.type = :type', { type });
      }

      if (difficulty) {
        queryBuilder.andWhere('session.difficulty = :difficulty', { difficulty });
      }

      if (isPremium !== undefined) {
        queryBuilder.andWhere('session.isPremium = :isPremium', { isPremium });
      }

      if (tags && tags.length > 0) {
        queryBuilder.andWhere('session.tags && :tags', { tags });
      }

      if (limit) {
        queryBuilder.limit(limit);
      }

      return await queryBuilder.getMany();
    } catch (error) {
      throw new Error(`Failed to fetch wellness sessions: ${error.message}`);
    }
  }

  async findSessionById(id: number): Promise<WellnessSession> {
    try {
      const session = await this.wellnessSessionRepository.findOne({
        where: { id, isActive: true }
      });

      if (!session) {
        throw new NotFoundException('Wellness session not found');
      }

      return session;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch wellness session: ${error.message}`);
    }
  }

  async startSession(sessionId: number, userId: number, startDto?: StartSessionDto): Promise<SessionProgress> {
    try {
      const session = await this.findSessionById(sessionId);

      // Check if user already has a progress record for this session
      let progress = await this.sessionProgressRepository.findOne({
        where: { sessionId, userId }
      });

      if (!progress) {
        progress = this.sessionProgressRepository.create({
          sessionId,
          userId,
          status: SessionStatus.IN_PROGRESS,
          startedAt: new Date(),
          sessionData: {
            ...startDto?.sessionData,
            duration: session.duration * 60 // Convert to seconds
          }
        });
      } else {
        // Update existing progress
        progress.status = SessionStatus.IN_PROGRESS;
        progress.startedAt = new Date();
        progress.pausedAt = null;
        if (startDto?.sessionData) {
          progress.sessionData = { ...progress.sessionData, ...startDto.sessionData };
        }
      }

      const savedProgress = await this.sessionProgressRepository.save(progress);

      // Increment session counter
      await this.wellnessSessionRepository.increment({ id: sessionId }, 'totalSessions', 1);

      return savedProgress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to start session: ${error.message}`);
    }
  }

  async updateSessionProgress(
    sessionId: number, 
    userId: number, 
    updateDto: UpdateSessionProgressDto
  ): Promise<SessionProgress> {
    try {
      const progress = await this.findUserSessionProgress(sessionId, userId);

      const updateData = {
        ...updateDto,
        pausedAt: updateDto.status === SessionStatus.PAUSED ? new Date() : null
      };

      await this.sessionProgressRepository.update(progress.id, updateData);
      return await this.findUserSessionProgress(sessionId, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update session progress: ${error.message}`);
    }
  }

  async completeSession(
    sessionId: number, 
    userId: number, 
    completeDto?: CompleteSessionDto
  ): Promise<SessionProgress> {
    try {
      const progress = await this.findUserSessionProgress(sessionId, userId);

      const updateData = {
        status: SessionStatus.COMPLETED,
        completedAt: new Date(),
        rating: completeDto?.rating,
        feedback: completeDto?.feedback,
        sessionData: { ...progress.sessionData, ...completeDto?.sessionData }
      };

      await this.sessionProgressRepository.update(progress.id, updateData);

      // Update session rating if rating provided
      if (completeDto?.rating) {
        await this.updateSessionRating(sessionId, completeDto.rating);
      }

      return await this.findUserSessionProgress(sessionId, userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to complete session: ${error.message}`);
    }
  }

  async getUserSessionProgress(userId: number, sessionId?: number): Promise<SessionProgress[]> {
    try {
      const whereClause: any = { userId };
      if (sessionId) {
        whereClause.sessionId = sessionId;
      }

      return await this.sessionProgressRepository.find({
        where: whereClause,
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      throw new Error(`Failed to get user session progress: ${error.message}`);
    }
  }

  async getWellnessStats(userId: number): Promise<WellnessStatsResponse> {
    try {
      const allProgress = await this.sessionProgressRepository.find({
        where: { userId },
        relations: ['wellnessSession']
      });

      if (allProgress.length === 0) {
        return this.getEmptyStats();
      }

      const completedSessions = allProgress.filter(p => p.status === SessionStatus.COMPLETED);
      const totalTimeSpent = Math.round(
        completedSessions.reduce((sum, p) => sum + (p.progressTime || 0), 0) / 60
      ); // Convert to minutes

      // Type breakdown
      const typeBreakdown = {};
      const sessionTypes = await this.wellnessSessionRepository.find({
        where: { id: In(allProgress.map(p => p.sessionId)) }
      });

      sessionTypes.forEach(session => {
        const userProgress = allProgress.filter(p => p.sessionId === session.id);
        const completed = userProgress.filter(p => p.status === SessionStatus.COMPLETED);
        const totalTime = Math.round(
          completed.reduce((sum, p) => sum + (p.progressTime || 0), 0) / 60
        );
        const ratings = completed.filter(p => p.rating).map(p => p.rating!);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;

        if (!typeBreakdown[session.type]) {
          typeBreakdown[session.type] = {
            count: 0,
            totalTime: 0,
            averageRating: 0
          };
        }

        typeBreakdown[session.type].count += completed.length;
        typeBreakdown[session.type].totalTime += totalTime;
        typeBreakdown[session.type].averageRating = averageRating;
      });

      // Find favorite type
      const favoriteType = Object.entries(typeBreakdown)
        .sort(([,a], [,b]) => (b as any).count - (a as any).count)[0]?.[0] as SessionType || null;

      // Calculate streak
      const streak = this.calculateStreak(completedSessions);

      return {
        totalSessions: allProgress.length,
        completedSessions: completedSessions.length,
        totalTimeSpent,
        averageSessionTime: completedSessions.length > 0 
          ? Math.round(totalTimeSpent / completedSessions.length) 
          : 0,
        completionRate: allProgress.length > 0 
          ? Math.round((completedSessions.length / allProgress.length) * 100) 
          : 0,
        favoriteType,
        streak,
        typeBreakdown,
        recentSessions: allProgress.slice(0, 10) // Last 10 sessions
      };
    } catch (error) {
      throw new Error(`Failed to get wellness stats: ${error.message}`);
    }
  }

  private async findUserSessionProgress(sessionId: number, userId: number): Promise<SessionProgress> {
    const progress = await this.sessionProgressRepository.findOne({
      where: { sessionId, userId }
    });

    if (!progress) {
      throw new NotFoundException('Session progress not found');
    }

    return progress;
  }

  private async updateSessionRating(sessionId: number, newRating: number): Promise<void> {
    const session = await this.findSessionById(sessionId);
    
    const currentTotal = session.averageRating * session.ratingCount;
    const newCount = session.ratingCount + 1;
    const newAverage = (currentTotal + newRating) / newCount;

    await this.wellnessSessionRepository.update(sessionId, {
      averageRating: Math.round(newAverage * 100) / 100,
      ratingCount: newCount
    });
  }

  private calculateStreak(completedSessions: SessionProgress[]): number {
    if (completedSessions.length === 0) return 0;

    const sessionDates = completedSessions
      .map(s => s.completedAt!.toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = today;

    for (const sessionDate of sessionDates) {
      if (sessionDate === currentDate) {
        streak++;
        const date = new Date(currentDate);
        date.setDate(date.getDate() - 1);
        currentDate = date.toDateString();
      } else {
        break;
      }
    }

    return streak;
  }

  private getEmptyStats(): WellnessStatsResponse {
    return {
      totalSessions: 0,
      completedSessions: 0,
      totalTimeSpent: 0,
      averageSessionTime: 0,
      completionRate: 0,
      favoriteType: null,
      streak: 0,
      typeBreakdown: {},
      recentSessions: []
    };
  }
}