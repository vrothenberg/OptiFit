import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../../src/auth/auth.service';
import { JwtStrategy } from '../../src/auth/strategies/jwt.strategy';
import { LocalStrategy } from '../../src/auth/strategies/local.strategy';
import { AuthController } from '../../src/auth/auth.controller';
import { UserModule } from '../../src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivityLog } from '../../src/user/entity/user-activity-log.entity';

// Mock AuthService that doesn't depend on actual strategies
class MockAuthService {
  async validateUser(email: string, password: string) {
    return { id: 1, email, firstName: 'Test', lastName: 'User' };
  }

  async login(user: any) {
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    };
  }

  async refreshToken(token: string) {
    return {
      accessToken: 'new-mock-access-token',
      refreshToken: 'new-mock-refresh-token',
    };
  }

  async validateToken(token: string) {
    return { sub: 1, email: 'test@example.com' };
  }
}

// Mock strategies that don't depend on Passport
class MockLocalStrategy {
  async validate(email: string, password: string) {
    return { id: 1, email };
  }
}

class MockJwtStrategy {
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'test-secret',
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    TypeOrmModule.forFeature([UserActivityLog]),
  ],
  controllers: [AuthController],
  providers: [
    { provide: AuthService, useClass: MockAuthService },
    { provide: LocalStrategy, useClass: MockLocalStrategy },
    { provide: JwtStrategy, useClass: MockJwtStrategy },
  ],
  exports: [AuthService],
})
export class MockAuthModule {}
