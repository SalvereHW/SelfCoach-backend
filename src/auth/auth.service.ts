import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    if (user && bcrypt.compareSync(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
      mfa_secret: speakeasy.generateSecret(), // Generate MFA secret
    };
  }

  async verifyMFA(token: string, secret: string): Promise<boolean> {
    return speakeasy.totp.verify({ secret, encoding: 'base32', token });
  }
}
