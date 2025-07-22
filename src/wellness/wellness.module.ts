import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { WellnessService } from './wellness.service.js';
import { WellnessController } from './wellness.controller.js';
import { WellnessSession } from './entities/wellness-session.entity.js';
import { SessionProgress } from './entities/session-progress.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([WellnessSession, SessionProgress]),
    ConfigModule,
    AuthModule,
    UserModule,
  ],
  controllers: [WellnessController],
  providers: [WellnessService],
  exports: [WellnessService],
})
export class WellnessModule {}
