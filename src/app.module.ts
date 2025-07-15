import { Module } from '@nestjs/common';
import { AdminModule } from '@adminjs/nestjs';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as AdminJSTypeorm from '@adminjs/typeorm'
import AdminJS from 'adminjs'

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserModule } from './user/user.module.js';
import { User } from './user/entities/user.entity.js';
// Legacy healthmetric module removed - replaced with new health module
import { HealthModule } from './health/health.module.js';
import { SleepMetric } from './health/sleep/sleep-metric.entity.js';
import { NutritionMetric } from './health/nutrition/nutrition-metric.entity.js';
import { ActivityMetric } from './health/activity/activity-metric.entity.js';
import { DailySummary } from './health/daily-summary/daily-summary.entity.js';
import { RemindersModule } from './reminders/reminders.module.js';
import { Reminder } from './reminders/entities/reminder.entity.js';
import { ReminderAction } from './reminders/entities/reminder-action.entity.js';
import { WellnessModule } from './wellness/wellness.module.js';
import { WellnessSession } from './wellness/entities/wellness-session.entity.js';
import { SessionProgress } from './wellness/entities/session-progress.entity.js';
import { LoggingModule } from './common/logging/logging.module.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { AuthModule } from './auth/auth.module.js';

// AdminJS.registerAdapter({
//   Resource: AdminJSTypeorm.Resource,
//   Database: AdminJSTypeorm.Database,
// })

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
};

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  // const user = await this.authService.validateUser(email, password);
  //   if (user && await this.authService.verifyMFA(mfaToken, user.mfaSecret)) {
  //     return user;
  //   }
  //   return null;
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'selfcoach-db',
      entities: [User, SleepMetric, NutritionMetric, ActivityMetric, DailySummary, Reminder, ReminderAction, WellnessSession, SessionProgress],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    // AdminModule.createAdminAsync({
    //   useFactory: async () => {
    //     return {
    //       adminJsOptions: {
    //         rootPath: '/admin',
    //         resources: [User, SleepMetric, NutritionMetric, ActivityMetric, DailySummary, Reminder, ReminderAction, WellnessSession, SessionProgress],
    //       },
    //       auth: {
    //         authenticate,
    //         cookiePassword: 'secret',
    //         cookieName: 'Admin',
    //       },
    //       sessionOptions: {
    //         resave: true,
    //         saveUninitialized: true,
    //         secret: 'secret',
    //       },
    //     };
    //   },
    // }),
    LoggingModule,
    AuthModule,
    UserModule,
    HealthModule,
    RemindersModule,
    WellnessModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
