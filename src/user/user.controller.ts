import { Body, Controller, Get, Post, Put, Delete, UseGuards, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service.js';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CreateUserProfileDto } from './dto/create-user-profile.dto.js';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto.js';

@Controller('api/users')
export class UserController {
    constructor(
        private readonly usersService: UserService,
        private readonly configService: ConfigService,
      ) {}

      // New profile management endpoints
      @Post('profile')
      async createUserProfile(@Body() createUserProfileDto: CreateUserProfileDto): Promise<User> {
        return await this.usersService.createUserProfile(createUserProfileDto);
      }

      @Get('profile/:supabaseUserId')
      @UseGuards(AuthGuard)
      async getUserProfile(@Param('supabaseUserId') supabaseUserId: string): Promise<User> {
        return await this.usersService.getUserProfile(supabaseUserId);
      }

      @Put('profile/:supabaseUserId')
      @UseGuards(AuthGuard)
      async updateUserProfile(
        @Param('supabaseUserId') supabaseUserId: string,
        @Body() updateUserProfileDto: UpdateUserProfileDto
      ): Promise<User> {
        return await this.usersService.updateUserProfile(supabaseUserId, updateUserProfileDto);
      }

      @Delete('profile/:supabaseUserId')
      @UseGuards(AuthGuard)
      @HttpCode(HttpStatus.NO_CONTENT)
      async deleteUserProfile(@Param('supabaseUserId') supabaseUserId: string): Promise<void> {
        return await this.usersService.deleteUserProfile(supabaseUserId);
      }

      // Legacy endpoints - keeping for backward compatibility
      @Get()
      @UseGuards(AuthGuard)
      async getUsers(): Promise<User[]> {
        return await this.usersService.findAllUsers();
      }

      @Post('/me')
      async getMe(@Body('email') email: string): Promise<User> {
        return await this.usersService.findUserByEmail(email);
      }

      @Post()
      createUser(@Body() user: User): Promise<User> {
        return this.usersService.createUser(user);
      }
}
