import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersService } from './reminders.service.js';
import { RemindersController } from './reminders.controller.js';
import { Reminder } from './entities/reminder.entity.js';
import { ReminderAction } from './entities/reminder-action.entity.js';
import { AuthModule } from '../auth/auth.module.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reminder, ReminderAction]),
    ConfigModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
  ],
  controllers: [RemindersController],
  providers: [RemindersService],
  exports: [RemindersService],
})
export class RemindersModule {}
