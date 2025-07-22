import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ActivityService } from './activity.service.js';
import { ActivityController } from './activity.controller.js';
import { ActivityMetric } from './activity-metric.entity.js';
import { AuthModule } from '../../auth/auth.module.js';
import { UserModule } from '../../user/user.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivityMetric]),
    ConfigModule,
    AuthModule,
    UserModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
