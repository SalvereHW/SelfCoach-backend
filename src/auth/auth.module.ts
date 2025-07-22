import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { JwtService } from './jwt.service.js';

@Module({
  imports: [ConfigModule, forwardRef(() => UserModule)],
  providers: [
    {
      provide: 'AUTH_GUARD',
      useClass: AuthGuard,
    },
    AuthGuard,
    AuthService,
    JwtService,
  ],
  exports: ['AUTH_GUARD', AuthGuard, AuthService, JwtService],
})
export class AuthModule {}
