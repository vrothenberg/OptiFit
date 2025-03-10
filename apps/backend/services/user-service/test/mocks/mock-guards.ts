import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class MockLocalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = { id: 1, email: 'test@example.com' };
    return true;
  }
}

@Injectable()
export class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    request.user = { id: 1, email: 'test@example.com' };
    return true;
  }
}
