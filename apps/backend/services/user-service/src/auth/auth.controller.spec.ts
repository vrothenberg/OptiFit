import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../user/entity/user.entity';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock AuthService
  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn((user: User) => ({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    })),
    refreshToken: jest.fn((token: string) => ({
      accessToken: 'new-test-access-token',
      refreshToken: 'new-test-refresh-token',
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const user = { id: 1, email: 'test@example.com' } as User;
      
      const result = await controller.login(loginDto, user);
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });

  describe('refreshToken', () => {
    it('should return new access and refresh tokens', async () => {
      const refreshToken = 'old-refresh-token';
      
      const result = await controller.refreshToken(refreshToken);
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });
    
    it('should throw UnauthorizedException when refresh token is missing', async () => {
      // Use empty string which will be falsy and trigger the same behavior
      await expect(controller.refreshToken('')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', () => {
      const user = { id: 1, email: 'test@example.com' } as User;
      
      const result = controller.getProfile(user);
      
      expect(result).toEqual(user);
    });
  });
});
