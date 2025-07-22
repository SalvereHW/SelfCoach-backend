import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule), // Use forwardRef to avoid circular dependency
  ],
  controllers: [UserController],
  providers: [UserService, ConfigService],
  exports: [UserService], // Export UserService so it can be used by AuthService
})
export class UserModule {}
