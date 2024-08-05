import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
      ) {}

      async createUser(createUser: User): Promise<User> {
        try {
            const user = await this.userRepository.save(createUser);
            return instanceToPlain(user) as User
        } catch (error) {
            throw new Error(error.message);
        }
      }

      async findAllUsers(): Promise<User[]> {
        try {
          const users = await this.userRepository.find({ relations: ['healthMetrics'] });
          return instanceToPlain(users) as User[];
        } catch (error) {
          throw new Error(error.message);
        }
      }

      async findUserByEmail(email: string): Promise<User> {
        try {
          return await this.userRepository.findOne({
            where: {
              email,
            },
            relations: ['healthMetrics']
          });
        } catch (error) {
          throw new Error(error.message);
        }
      }


}
