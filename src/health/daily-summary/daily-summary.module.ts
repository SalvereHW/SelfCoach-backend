import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DailySummaryService } from './daily-summary.service.js';
import { DailySummaryController } from './daily-summary.controller.js';
import { DailySummary } from './daily-summary.entity.js';
import { AuthModule } from '../../auth/auth.module.js';
import { UserModule } from '../../user/user.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailySummary]),
    ConfigModule,
    AuthModule,
    UserModule,
  ],
  controllers: [DailySummaryController],
  providers: [DailySummaryService],
  exports: [DailySummaryService],
})
export class DailySummaryModule {}