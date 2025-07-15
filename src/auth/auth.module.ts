import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { JwtService } from './jwt.service.js';


@Module({
  imports: [ConfigModule, forwardRef(() => UserModule)],
  providers: [AuthGuard, AuthService, JwtService],
  exports: [AuthGuard, AuthService, JwtService],
})
export class AuthModule {}