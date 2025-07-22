import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SleepService } from './sleep.service.js';
import { SleepController } from './sleep.controller.js';
import { SleepMetric } from './sleep-metric.entity.js';
import { AuthModule } from '../../auth/auth.module.js';
import { UserModule } from '../../user/user.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([SleepMetric]),
    ConfigModule,
    AuthModule,
    UserModule,
  ],
  controllers: [SleepController],
  providers: [SleepService],
  exports: [SleepService],
})
export class SleepModule {}
