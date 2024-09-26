import { Module } from '@nestjs/common';
import { AdminModule } from '@adminjs/nestjs';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as AdminJSTypeorm from '@adminjs/typeorm'
import AdminJS from 'adminjs'

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UserModule } from './user/user.module.js';
import { User } from './user/entities/user.entity.js';
import { HealthmetricModule } from './healthmetric/healthmetric.module.js';
import { HealthMetric } from './healthmetric/entities/healthmetric.entity.js';

AdminJS.registerAdapter({
  Resource: AdminJSTypeorm.Resource,
  Database: AdminJSTypeorm.Database,
})

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
};

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  // const user = await this.authService.validateUser(email, password);
  //   if (user && await this.authService.verifyMFA(mfaToken, user.mfaSecret)) {
  //     return user;
  //   }
  //   return null;
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'selfcoach-db',
      entities: [User, HealthMetric],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    AdminModule.createAdminAsync({
      useFactory: async () => {
        return {
          adminJsOptions: {
            rootPath: '/admin',
            resources: [User, HealthMetric],
          },
          auth: {
            authenticate,
            cookiePassword: 'secret',
            cookieName: 'Admin',
          },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'secret',
          },
        };
      },
    }),
    UserModule,
    HealthmetricModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
