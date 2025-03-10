import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  // Define a mock for the UserService with jest.fn() for each method.
  const userServiceMock = {
    create: jest.fn((dto: CreateUserDto) => Promise.resolve({ id: 1, ...dto })),
    findAll: jest.fn(() => Promise.resolve([{ id: 1, firstName: 'John', lastName: 'Doe' }])),
    findOne: jest.fn((id: number) => Promise.resolve({ id, firstName: 'John', lastName: 'Doe' })),
    update: jest.fn((id: number, dto: UpdateUserDto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn((id: number) => Promise.resolve()),
    getUserProfile: jest.fn((userId: number) =>
      Promise.resolve({ userId, gender: 'male', dateOfBirth: '1990-01-01' }),
    ),
    updateUserProfile: jest.fn((userId: number, dto: UpdateUserProfileDto) =>
      Promise.resolve({ userId, ...dto }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userServiceMock }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test for creating a user (which also creates a profile)
  describe('create', () => {
    it('should create a user and return the created user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
      };

      const result = await controller.create(createUserDto);
      expect(result).toHaveProperty('id', 1);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  // Test for retrieving all users
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([{ id: 1, firstName: 'John', lastName: 'Doe' }]);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  // Test for retrieving a single user
  describe('findOne', () => {
    it('should return a user with the given id', async () => {
      // Pass numeric id since ParseIntPipe converts the param to a number.
      const result = await controller.findOne(1);
      expect(result).toEqual({ id: 1, firstName: 'John', lastName: 'Doe' });
      expect(userService.findOne).toHaveBeenCalledWith(1);
    });
  });

  // Test for updating a user
  describe('update', () => {
    it('should update and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = { phoneNumber: '0987654321' };
      const result = await controller.update(1, updateUserDto);
      expect(result).toEqual({ id: 1, ...updateUserDto });
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
    });
  });

  // Test for deleting a user
  describe('remove', () => {
    it('should call the service remove method', async () => {
      await controller.remove(1);
      expect(userService.remove).toHaveBeenCalledWith(1);
    });
  });

  // Test for retrieving a user profile
  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const result = await controller.getProfile(1);
      expect(result).toEqual({ userId: 1, gender: 'male', dateOfBirth: '1990-01-01' });
      expect(userService.getUserProfile).toHaveBeenCalledWith(1);
    });
  });

  // Test for updating a user profile
  describe('updateProfile', () => {
    it('should update and return the updated profile', async () => {
      const updateProfileDto: UpdateUserProfileDto = { weightKg: 70, heightCm: 180 };
      const result = await controller.updateProfile(1, updateProfileDto);
      expect(result).toEqual({ userId: 1, ...updateProfileDto });
      expect(userService.updateUserProfile).toHaveBeenCalledWith(1, updateProfileDto);
    });
  });
});
