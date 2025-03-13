import { Injectable, NotFoundException, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { CircadianQuestionnaire } from './entity/circadian-questionnaire.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CircadianQuestionnaireDto } from './dto/circadian-questionnaire.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CircadianQuestionnaire)
    private readonly circadianQuestionnaireRepository: Repository<CircadianQuestionnaire>,
  ) {}

  private readonly logger = new Logger(UserService.name);

  // Create a new user with all profile data included
  // @deprecated This method uses a legacy endpoint. Please use the two-step registration process with
  // AuthService.register() and AuthService.completeRegistration() instead.
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.logger.warn(
        'DEPRECATED: UserService.create() is deprecated and will be removed in a future version. ' +
        'Please use the two-step registration process with AuthService.register() and AuthService.completeRegistration() instead.'
      );
      
      // Check if user with this email already exists
      const existingUser = await this.userRepository.findOne({ 
        where: { email: createUserDto.email } 
      });
      
      if (existingUser) {
        this.logger.warn(`Attempted to create user with existing email: ${createUserDto.email}`);
        throw new ConflictException('User with this email already exists');
      }
      
      // Extract password separately so we can hash it
      const { password, ...userData } = createUserDto;
      
      this.logger.debug(`Password to hash: length=${password.length}, first2chars=${password.substring(0, 2)}`);
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      this.logger.debug(`Password hashed with salt rounds: 10, hash length=${hashedPassword.length}`);
      
      // Create the user entity with hashed password and all profile data
      const newUser = this.userRepository.create({ 
        ...userData, 
        hashedPassword 
      });
      
      this.logger.debug(`Creating new user with email: ${createUserDto.email}, hashedPassword length: ${newUser.hashedPassword.length}`);
      const savedUser = await this.userRepository.save(newUser);
      this.logger.debug(`User created with ID: ${savedUser.id}, hashedPassword in DB: ${savedUser.hashedPassword.substring(0, 10)}...`);
    
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
    // Get the current user
    const user = await this.findOne(id);
    
    // Update the user with the new data
    Object.assign(user, updateUserDto);
    
    // Save the updated user
    return await this.userRepository.save(user);
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

  // CIRCADIAN QUESTIONNAIRE METHODS

  async submitCircadianQuestionnaire(userId: number, questionnaireDto: CircadianQuestionnaireDto): Promise<CircadianQuestionnaire> {
    // Verify user exists
    await this.findOne(userId);
    
    // Create a new questionnaire entity
    const questionnaire = this.circadianQuestionnaireRepository.create({
      userId,
      ...questionnaireDto
    });
    
    this.logger.debug(`Submitting circadian questionnaire for user ID: ${userId}`);
    
    // Save the questionnaire
    return await this.circadianQuestionnaireRepository.save(questionnaire);
  }

  async getCircadianQuestionnaires(userId: number): Promise<CircadianQuestionnaire[]> {
    // Verify user exists
    await this.findOne(userId);
    
    return await this.circadianQuestionnaireRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async getLatestCircadianQuestionnaire(userId: number): Promise<CircadianQuestionnaire | null> {
    // Verify user exists
    await this.findOne(userId);
    
    const questionnaires = await this.circadianQuestionnaireRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 1
    });
    
    return questionnaires.length > 0 ? questionnaires[0] : null;
  }
}
