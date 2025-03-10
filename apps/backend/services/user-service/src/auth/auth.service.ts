import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Tokens } from './interfaces/tokens.interface';
import { User } from '../user/entity/user.entity';
import { LoginDto } from './dto/login.dto';
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
    // Create JWT payload
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

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

    // Generate tokens
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