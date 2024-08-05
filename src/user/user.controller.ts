import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service.js';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity.js';

@Controller('user')
export class UserController {
    constructor(
        private readonly usersService: UserService,
        private readonly configService: ConfigService, // private readonly permifyService: PermifyService,
      ) {}

      @Get()
      async getUsers(): Promise<User[]> {
        return await this.usersService.findAllUsers();
      }

      @Post('/me')
      async getMe(@Body('email') email: string): Promise<User> {
        return await this.usersService.findUserByEmail(email);
      }

      @Post()
      createUser(user: User): Promise<User> {
        return this.usersService.createUser(user);
      }
}
