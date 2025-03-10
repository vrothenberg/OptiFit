// test/test-utils.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../src/auth/guards/local-auth.guard';
import { UserModule } from '../src/user/user.module';
import { User } from '../src/user/entity/user.entity';
import { UserProfile } from '../src/user/entity/user-profile.entity';
import { UserActivityLog } from '../src/user/entity/user-activity-log.entity';
import { MockAuthModule } from './mocks/mock-auth.module';
import { MockJwtAuthGuard, MockLocalAuthGuard } from './mocks/mock-guards';

export async function createTestingApp(): Promise<INestApplication> {
  // Create a test module with SQLite
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [User, UserProfile, UserActivityLog],
        synchronize: true,
      }),
      UserModule,
      MockAuthModule, // Use the mock auth module instead of the real one
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useClass(MockJwtAuthGuard)
    .overrideGuard(LocalAuthGuard)
    .useClass(MockLocalAuthGuard)
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  
  return app;
}
