import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseService } from './firebase.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret:
            configService.get<string>('jwt.secret') || 'default-secret-key',
          signOptions: {
            expiresIn: (configService.get<string>('jwt.expiresIn') ||
              '7d') as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, FirebaseService, JwtStrategy, FirebaseAuthGuard],
  exports: [
    AuthService,
    FirebaseService,
    FirebaseAuthGuard,
    UsersModule, // Export UsersModule so FirebaseAuthGuard can access UsersService
  ],
})
export class AuthModule {}
