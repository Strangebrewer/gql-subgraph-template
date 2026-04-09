import { CanActivate, createParamDecorator, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = GqlExecutionContext.create(context).getContext().req;
    const authHeader: string | undefined = request.get('Authorization');

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException();
    }

    try {
      const verified = this.jwtService.verify(token);
      request.userId = verified.sub;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

export const JwtUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = GqlExecutionContext.create(ctx).getContext().req;
    return request.userId;
  },
);
