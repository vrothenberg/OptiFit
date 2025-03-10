import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Tokens } from './interfaces/tokens.interface';
import { User } from '../user/entity/user.entity';
import { LoginDto } from './dto/login.dto';
import { InitialRegisterDto } from './dto/initial-register.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { UserActivityLog } from '../user/entity/user-activity-log.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(UserActivityLog)
    private readonly activityLogRepository: Repository<UserActivityLog>,
  ) {}

  async register(initialRegisterDto: InitialRegisterDto): Promise<Tokens> {
    try {
      // Check if user with this email already exists
      try {
        // Use the userService to find a user by email
        await this.userService.findByEmail(initialRegisterDto.email);
        // If we get here, a user with this email exists
        throw new ConflictException('User with this email already exists');
      } catch (error) {
        // If it's a NotFoundException, that's good - it means the user doesn't exist
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }

      // Create minimal user with email and password
      const minimalUserData = {
        email: initialRegisterDto.email,
        password: initialRegisterDto.password,
        // Add placeholder values for required fields
        firstName: 'Pending',
        lastName: 'Registration',
      };

      // Create the user
      const user = await this.userService.create(minimalUserData);

      // Log registration activity
      const activityLog = this.activityLogRepository.create({
        user,
        eventType: 'registration',
        eventData: {
          timestamp: new Date().toISOString(),
        },
      });
      await this.activityLogRepository.save(activityLog);

      // Generate and return tokens
      return this.generateTokens(user);
    } catch (error) {
      if (error.status) {
        throw error; // Re-throw NestJS HTTP exceptions
      }
      throw new BadRequestException(`Registration failed: ${error.message}`);
    }
  }

  async completeRegistration(userId: number, completeRegistrationDto: CompleteRegistrationDto): Promise<User> {
    try {
      // Get the user
      const user = await this.userService.findOne(userId);

      // Update user with profile data
      const { firstName, lastName, phoneNumber, ...profileData } = completeRegistrationDto;
      
      // Update basic user info
      const updatedUser = await this.userService.update(userId, {
        firstName,
        lastName,
        phoneNumber,
      });

      // Update or create user profile
      await this.userService.updateUserProfile(userId, profileData);

      // Log profile completion activity
      const activityLog = this.activityLogRepository.create({
        user,
        eventType: 'profile_completion',
        eventData: {
          timestamp: new Date().toISOString(),
        },
      });
      await this.activityLogRepository.save(activityLog);

      // Return the updated user with profile
      return this.userService.findOne(userId);
    } catch (error) {
      if (error.status) {
        throw error; // Re-throw NestJS HTTP exceptions
      }
      throw new BadRequestException(`Profile completion failed: ${error.message}`);
    }
  }

  private generateTokens(user: User): Tokens {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
      }),
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      // Find user by email
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return null;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
      if (!isPasswordValid) {
        return null;
      }

      // Return user without password
      const { hashedPassword, ...result } = user;
      return result;
    } catch (error) {
      return null;
    }
  }

  async login(user: User): Promise<Tokens> {
    // Log login activity
    const activityLog = this.activityLogRepository.create({
        user,
        eventType: 'login',
        eventData: {
        timestamp: new Date().toISOString(),
        ip: 'IP_ADDRESS', // You would get this from the request
        userAgent: 'USER_AGENT', // You would get this from the request
        },
    });
    await this.activityLogRepository.save(activityLog);

    // Generate and return tokens
    return this.generateTokens(user);
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(token: string): Promise<Tokens> {
    try {
      // Verify refresh token
      const payload = await this.validateToken(token);
      
      // Get user
      const user = await this.userService.findOne(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new tokens
      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
