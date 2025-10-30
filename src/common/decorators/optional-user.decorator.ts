import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Extracts the authenticated user from the request if available.
 * Returns undefined if no user is authenticated.
 * Use this decorator for endpoints where authentication is optional.
 */
export const OptionalUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    return request.user;
  },
);
