import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { UserProfile } from './entity/user-profile.entity';
import { NotFoundException } from '@nestjs/common';

// Create simple mock repositories with more flexible return types
const mockUserRepository = {
  create: jest.fn(dto => dto),
  save: jest.fn(dto => Promise.resolve({ id: 1, ...dto })),
  update: jest.fn(() => Promise.resolve({ affected: 1 })),
  findOne: jest.fn(),
  find: jest.fn(() => Promise.resolve([{ id: 1, firstName: 'John', lastName: 'Doe' }])),
  delete: jest.fn(() => Promise.resolve({ affected: 1 })),
};

const mockUserProfileRepository = {
  create: jest.fn(dto => dto),
  save: jest.fn(dto => Promise.resolve({ userId: 1, ...dto })),
  findOne: jest.fn(),
  merge: jest.fn((existing, dto) => Object.assign(existing, dto)),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    // Reset mock implementations before each test
    mockUserRepository.findOne.mockReset();
    mockUserProfileRepository.findOne.mockReset();

    // Default implementation for findOne
    mockUserRepository.findOne.mockImplementation(({ where }) => {
      if (where.id === 1 || where.email === 'test@example.com') {
        return Promise.resolve({ id: 1, firstName: 'John', lastName: 'Doe', email: 'test@example.com' });
      }
      return Promise.resolve(null);
    });

    mockUserProfileRepository.findOne.mockImplementation(({ where }) => {
      if (where.userId === 1) {
        return Promise.resolve({ userId: 1, gender: 'male', dateOfBirth: new Date('1990-01-01') });
      }
      return Promise.resolve(null);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(UserProfile), useValue: mockUserProfileRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and profile', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        profile: { gender: 'male' },
      };
      
      const result = await service.create(createUserDto);
      
      expect(result).toHaveProperty('id');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockUserProfileRepository.create).toHaveBeenCalled();
      expect(mockUserProfileRepository.save).toHaveBeenCalled();
    });
  });
  
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();
      
      expect(Array.isArray(result)).toBe(true);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });
  
  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await service.findOne(1);
      
      expect(result).toHaveProperty('id', 1);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
    
    it('should throw NotFoundException when user is not found', async () => {
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const result = await service.findByEmail('test@example.com');
      
      expect(result).toHaveProperty('email', 'test@example.com');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });
    
    it('should throw NotFoundException when user is not found', async () => {
      await expect(service.findByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
    });
  });
  
  // Add more tests for update, remove, getUserProfile, updateUserProfile
  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
      };
      
      await service.update(1, updateUserDto);
      
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateUserDto);
    });
    
    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.update.mockResolvedValueOnce({ affected: 0 });
      
      await expect(service.update(999, { firstName: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('remove', () => {
    it('should remove a user', async () => {
      await service.remove(1);
      
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });
    
    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.delete.mockResolvedValueOnce({ affected: 0 });
      
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('getUserProfile', () => {
    it('should return a user profile', async () => {
      const result = await service.getUserProfile(1);
      
      expect(result).toHaveProperty('userId', 1);
      expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
    });
    
    it('should throw NotFoundException when profile is not found', async () => {
      await expect(service.getUserProfile(999)).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('updateUserProfile', () => {
    it('should update a user profile when it exists', async () => {
      const updateProfileDto = {
        weightKg: 70,
        heightCm: 180,
      };
      
      mockUserProfileRepository.findOne.mockResolvedValueOnce({
        userId: 1,
        gender: 'male',
        dateOfBirth: new Date('1990-01-01'),
      });
      
      const result = await service.updateUserProfile(1, updateProfileDto);
      
      expect(result).toHaveProperty('weightKg', 70);
      expect(result).toHaveProperty('heightCm', 180);
      expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(mockUserProfileRepository.merge).toHaveBeenCalled();
      expect(mockUserProfileRepository.save).toHaveBeenCalled();
    });
    
    it('should create a new profile when it does not exist', async () => {
      const updateProfileDto = {
        weightKg: 70,
        heightCm: 180,
      };
      
      // Mock that the profile doesn't exist
      mockUserProfileRepository.findOne.mockResolvedValueOnce(null);
      
      const result = await service.updateUserProfile(999, updateProfileDto);
      
      expect(result).toHaveProperty('userId', 999);
      expect(result).toHaveProperty('weightKg', 70);
      expect(result).toHaveProperty('heightCm', 180);
      expect(mockUserProfileRepository.findOne).toHaveBeenCalledWith({ where: { userId: 999 } });
      expect(mockUserProfileRepository.create).toHaveBeenCalledWith({ 
        userId: 999, 
        ...updateProfileDto 
      });
      expect(mockUserProfileRepository.save).toHaveBeenCalled();
    });
  });
});
