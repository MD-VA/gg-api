import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from '../firebase.service';
import { UsersService } from '../../users/users.service';

/**
 * Optional Firebase Authentication Guard
 * Attempts to authenticate the user but DOES NOT fail if authentication fails.
 * Use this for endpoints where authentication is optional.
 * If authenticated, attaches user to request.user
 * If not authenticated, request.user remains undefined
 */
@Injectable()
export class OptionalFirebaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(OptionalFirebaseAuthGuard.name);

  constructor(
    private firebaseService: FirebaseService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    try {
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        // No token provided - this is OK for optional auth
        this.logger.debug('No authentication token provided (optional auth)');
        return true;
      }

      // Verify Firebase token
      const decodedToken = await this.firebaseService.verifyIdToken(token);

      // Find or create user
      const user = await this.usersService.findOrCreate({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name,
        photoUrl: decodedToken.picture,
      });

      // Attach user to request
      (request as any)['user'] = user;
      this.logger.debug(`User authenticated: ${user.email}`);

      return true;
    } catch (error) {
      // Authentication failed - this is OK for optional auth
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.debug(
        `Optional authentication failed: ${errorMessage}`,
      );
      return true; // Allow request to proceed without user
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
