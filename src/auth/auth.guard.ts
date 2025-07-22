import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { UserService } from '../user/user.service.js';
import { JwtService } from './jwt.service.js';
import { User } from '../user/entities/user.entity.js';

export interface AuthenticatedRequest extends Request {
  user: User;
  payload: any;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      // Validate JWT token
      const payload = await this.jwtService.validateSupabaseToken(token);

      // Find or create user
      const user = await this.findOrCreateUser(payload);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Attach user and payload to request
      request.user = user;
      request.payload = payload;

      return true;
    } catch (error) {
      this.logger.warn(`Authentication failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async findOrCreateUser(payload: any) {
    // Try to find user by Supabase ID first
    let user = await this.userService.findUserBySupabaseId(payload.sub);

    if (!user && payload.email) {
      // Try to find by email and link accounts
      user = await this.userService.findUserByEmail(payload.email);
      if (user) {
        // Link Supabase ID to existing user
        await this.userService.linkSupabaseId(user.id, payload.sub);
      } else {
        // Create new user
        user = await this.userService.createFromSupabasePayload(payload);
      }
    }

    return user;
  }
}
