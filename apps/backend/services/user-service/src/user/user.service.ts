import { Injectable, NotFoundException, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { UserProfile } from './entity/user-profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
  ) {}

  private readonly logger = new Logger(UserService.name);

  // Create a new user and automatically create an associated profile.
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if user with this email already exists
      const existingUser = await this.userRepository.findOne({ 
        where: { email: createUserDto.email } 
      });
      
      if (existingUser) {
        this.logger.warn(`Attempted to create user with existing email: ${createUserDto.email}`);
        throw new ConflictException('User with this email already exists');
      }
      
      // Extract password separately so we can hash it
      const { password, profile: profileData, ...userData } = createUserDto;
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create the user entity with hashed password
      const newUser = this.userRepository.create({ 
        ...userData, 
        hashedPassword 
      });
      
      this.logger.debug(`Creating new user with email: ${createUserDto.email}`);
      const savedUser = await this.userRepository.save(newUser);
      this.logger.debug(`User created with ID: ${savedUser.id}`);
    
      // Create associated profile
      try {
        const newProfile = this.profileRepository.create({
          userId: savedUser.id,
          ...profileData,
        });
        await this.profileRepository.save(newProfile);
        this.logger.debug(`Profile created for user ID: ${savedUser.id}`);
      } catch (profileError) {
        this.logger.error(`Failed to create profile for user ID ${savedUser.id}: ${profileError.message}`);
        // User was created but profile failed - we should still return the user
        // Consider adding cleanup logic here if needed
      }
    
      return savedUser;
    } catch (error) {
      // Handle TypeORM specific errors
      if (error.code === '23505') { // PostgreSQL unique violation code
        this.logger.warn(`Database constraint violation: ${error.detail}`);
        throw new ConflictException('User with this email already exists');
      }
      
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      
      // Re-throw the error if it's already a NestJS HttpException
      if (error.status) {
        throw error;
      }
      
      // Otherwise wrap it in a BadRequestException with a more helpful message
      throw new BadRequestException(
        `Failed to create user: ${error.message || 'Unknown error'}`
      );
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const result = await this.userRepository.update(id, updateUserDto);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // PROFILE METHODS

  async getUserProfile(userId: number): Promise<UserProfile> {
    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException(`Profile not found for user id ${userId}`);
    }
    return profile;
  }

  async updateUserProfile(userId: number, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepository.create({ userId, ...updateUserProfileDto });
    } else {
      this.profileRepository.merge(profile, updateUserProfileDto);
    }
    return await this.profileRepository.save(profile);
  }


}
