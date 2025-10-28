import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-redis-store';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { User } from './users/entities/user.entity';
import { UserGame } from './games/entities/user-game.entity';
import { Comment } from './comments/entities/comment.entity';
import { AffiliateLink } from './affiliate/entities/affiliate-link.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { UserLibraryModule } from './user-library/user-library.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [User, UserGame, Comment, AffiliateLink],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        migrations: ['dist/database/migrations/**/*.js'],
        migrationsRun: false,
      }),
    }),

    // Redis Cache
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        password: configService.get('redis.password') || undefined,
        ttl: configService.get('redis.ttl'),
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get('throttle.ttl', 60) * 1000,
            limit: configService.get('throttle.limit', 100),
          },
        ],
      }),
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    GamesModule,
    UserLibraryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
