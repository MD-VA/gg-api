import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from './firebase.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './dto/jwt-payload.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      // Verify Firebase token
      const decodedToken = await this.firebaseService.verifyIdToken(
        loginDto.firebaseToken,
      );

      this.logger.log(`Firebase token verified for UID: ${decodedToken.uid}`);

      // Find or create user
      const user = await this.usersService.findOrCreate({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name,
        photoUrl: decodedToken.picture,
      });

      // Generate JWT token
      const accessToken = await this.generateToken(user);

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoUrl: user.photoUrl,
          firebaseUid: user.firebaseUid,
        },
      };
    } catch (error) {
      this.logger.error('Login failed', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findById(payload.userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      firebaseUid: user.firebaseUid,
    };

    const jwt = await this.jwtService.signAsync(payload);

    return jwt;
  }
}
