import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';
import { CreateUserProfileDto } from './dto/create-user-profile.dto.js';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto.js';
import { LoggerService } from '../common/logging/logger.service.js';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  async createUserProfile(
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<User> {
    const logContext = {
      endpoint: 'user/create-profile',
      action: 'create_user_profile',
    };

    try {
      // Check if user with Supabase ID already exists
      const existingUser = await this.findUserBySupabaseId(
        createUserProfileDto.supabaseUserId,
      );
      if (existingUser) {
        this.loggerService.warn(
          'Attempted to create user with existing Supabase ID',
          logContext,
        );
        throw new BadRequestException(
          'User with this Supabase ID already exists',
        );
      }

      // Check if email already exists
      const existingEmail = await this.findUserByEmail(
        createUserProfileDto.email,
      );
      if (existingEmail) {
        this.loggerService.warn(
          'Attempted to create user with existing email',
          logContext,
        );
        throw new BadRequestException('User with this email already exists');
      }

      const user = this.userRepository.create({
        ...createUserProfileDto,
        dateOfBirth: createUserProfileDto.dateOfBirth
          ? new Date(createUserProfileDto.dateOfBirth)
          : null,
      });

      const savedUser = await this.userRepository.save(user);

      this.loggerService.info('User profile created successfully', {
        ...logContext,
        userId: savedUser.id,
      });

      this.loggerService.logDataAccess('create', 'user_profile', {
        ...logContext,
        userId: savedUser.id,
      });

      return instanceToPlain(savedUser) as User;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.loggerService.error(
        'Failed to create user profile',
        error,
        logContext,
      );
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  async updateUserProfile(
    supabaseUserId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<User> {
    try {
      const user = await this.findUserBySupabaseId(supabaseUserId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updateData = {
        ...updateUserProfileDto,
        dateOfBirth: updateUserProfileDto.dateOfBirth
          ? new Date(updateUserProfileDto.dateOfBirth)
          : user.dateOfBirth,
      };

      await this.userRepository.update(user.id, updateData);
      const updatedUser = await this.findUserBySupabaseId(supabaseUserId);
      return instanceToPlain(updatedUser) as User;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  async getUserProfile(supabaseUserId: string): Promise<User> {
    try {
      const user = await this.findUserBySupabaseId(supabaseUserId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return instanceToPlain(user) as User;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  async deleteUserProfile(supabaseUserId: string): Promise<void> {
    try {
      const user = await this.findUserBySupabaseId(supabaseUserId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.userRepository.delete(user.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete user profile: ${error.message}`);
    }
  }

  async findUserBySupabaseId(supabaseUserId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { supabaseUserId },
      });
    } catch (error) {
      throw new Error(`Failed to find user by Supabase ID: ${error.message}`);
    }
  }

  async findAllUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.find();
      return instanceToPlain(users) as User[];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Legacy method - keeping for backward compatibility
  async createUser(createUser: User): Promise<User> {
    try {
      const user = await this.userRepository.save(createUser);
      return instanceToPlain(user) as User;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Method to link Supabase ID to existing user
  async linkSupabaseId(userId: number, supabaseUserId: string): Promise<User> {
    const logContext = {
      endpoint: 'user/link-supabase-id',
      action: 'link_supabase_id',
      userId,
    };

    try {
      await this.userRepository.update(userId, { supabaseUserId });
      const updatedUser = await this.userRepository.findOne({
        where: { id: userId },
      });

      this.loggerService.info(
        'Supabase ID linked to existing user',
        logContext,
      );
      this.loggerService.logDataAccess('update', 'user_profile', logContext);

      return instanceToPlain(updatedUser) as User;
    } catch (error) {
      this.loggerService.error('Failed to link Supabase ID', error, logContext);
      throw new Error(`Failed to link Supabase ID: ${error.message}`);
    }
  }

  // Method to create user from Supabase JWT payload
  async createFromSupabasePayload(payload: any): Promise<User> {
    const logContext = {
      endpoint: 'user/create-from-supabase',
      action: 'create_from_supabase_payload',
    };

    try {
      const user = this.userRepository.create({
        supabaseUserId: payload.sub,
        email: payload.email,
        // Set default values for required fields
        firstName: payload.user_metadata?.first_name || 'Unknown',
        lastName: payload.user_metadata?.last_name || 'User',
        isActive: true,
      });

      const savedUser = await this.userRepository.save(user);

      this.loggerService.info('User created from Supabase payload', {
        ...logContext,
        userId: savedUser.id,
      });

      this.loggerService.logDataAccess('create', 'user_profile', {
        ...logContext,
        userId: savedUser.id,
      });

      return instanceToPlain(savedUser) as User;
    } catch (error) {
      this.loggerService.error(
        'Failed to create user from Supabase payload',
        error,
        logContext,
      );
      throw new Error(
        `Failed to create user from Supabase payload: ${error.message}`,
      );
    }
  }
}
