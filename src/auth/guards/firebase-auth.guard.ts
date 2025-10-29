import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from '../firebase.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseAuthGuard.name);

  constructor(
    private firebaseService: FirebaseService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      // 1. Extract token from Authorization header
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('No Firebase token provided');
      }

      // 2. Verify token with Firebase Admin SDK
      const decodedToken = await this.firebaseService.verifyIdToken(token);
      this.logger.log(`Token verified for Firebase UID: ${decodedToken.uid}`);

      // 3. Find or create user in database
      const user = await this.usersService.findOrCreate({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name,
        photoUrl: decodedToken.picture,
      });

      // 4. Attach user to request for use in controllers
      request['user'] = user;

      return true;
    } catch (error) {
      this.logger.error('Firebase token verification failed', error.message);
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    // Format: "Bearer <token>"
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
