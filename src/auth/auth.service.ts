import { Injectable, Logger } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { UserService } from '../user/user.service.js';
import { JwtService } from './jwt.service.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private userCache = new NodeCache.default({ stdTTL: 300 }); // Cache users for 5 minutes

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(token: string) {
    const payload = await this.jwtService.validateSupabaseToken(token);

    // Check cache first
    const cacheKey = `user_${payload.sub}`;
    let user = this.userCache.get(cacheKey);

    if (!user) {
      user = await this.userService.findUserBySupabaseId(payload.sub);
      if (user) {
        this.userCache.set(cacheKey, user);
      }
    }

    return { user, payload };
  }

  invalidateUserCache(userId: string) {
    this.userCache.del(`user_${userId}`);
  }
}
