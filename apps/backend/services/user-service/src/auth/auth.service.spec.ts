// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { UserActivityLog } from '../user/entity/user-activity-log.entity';
import { User } from '../user/entity/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;

  const mockUserService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret';
      if (key === 'JWT_EXPIRATION') return '1h';
      if (key === 'JWT_REFRESH_EXPIRATION') return '7d';
      return null;
    }),
  };

  const mockActivityLogRepo = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: getRepositoryToken(UserActivityLog),
          useValue: mockActivityLogRepo,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        hashedPassword: await bcrypt.hash('password123', 10),
        firstName: 'Test',
        lastName: 'User',
      };
      
      mockUserService.findByEmail.mockResolvedValue(user);
      
      const result = await service.validateUser('test@example.com', 'password123');
      
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
    });

    it('should return null when user is not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      
      const result = await service.validateUser('nonexistent@example.com', 'password123');
      
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
      } as User;
      
      const result = await service.login(user);
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockActivityLogRepo.create).toHaveBeenCalled();
      expect(mockActivityLogRepo.save).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const payload = { sub: 1, email: 'test@example.com' };
      // Include isActive property in the mock user
      const user = { id: 1, email: 'test@example.com', isActive: true } as User;
      
      mockJwtService.verify.mockReturnValue(payload);
      mockUserService.findOne.mockResolvedValue(user);
      
      const result = await service.refreshToken('valid-refresh-token');
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockJwtService.verify).toHaveBeenCalled();
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
    });
    
    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await expect(service.refreshToken('invalid-token')).rejects.toThrow();
    });
    
    it('should throw UnauthorizedException when user is not found', async () => {
      const payload = { sub: 999, email: 'nonexistent@example.com' };
      
      mockJwtService.verify.mockReturnValue(payload);
      mockUserService.findOne.mockResolvedValue(null);
      
      await expect(service.refreshToken('valid-token-unknown-user')).rejects.toThrow();
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      const payload = { sub: 1, email: 'test@example.com' };
      // User with isActive set to false
      const user = { id: 1, email: 'test@example.com', isActive: false } as User;
      
      mockJwtService.verify.mockReturnValue(payload);
      mockUserService.findOne.mockResolvedValue(user);
      
      await expect(service.refreshToken('valid-token-inactive-user')).rejects.toThrow();
    });
  });
});
