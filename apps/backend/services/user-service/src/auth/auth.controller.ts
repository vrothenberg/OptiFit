import { Controller, Post, Body, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import { Public } from './decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { InitialRegisterDto } from './dto/initial-register.dto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../user/entity/user.entity';
import { Tokens } from './interfaces/tokens.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Initial user registration with email and password' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() initialRegisterDto: InitialRegisterDto): Promise<Tokens> {
    return this.authService.register(initialRegisterDto);
  }

  @Post('complete-registration')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete user registration with profile data' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeRegistration(
    @CurrentUser() user: User,
    @Body() completeRegistrationDto: CompleteRegistrationDto
  ): Promise<User> {
    return this.authService.completeRegistration(user.id, completeRegistrationDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto, @CurrentUser() user: User): Promise<Tokens> {
    console.log(`[AuthController] Login attempt for email: ${loginDto.email}`);
    console.log(`[AuthController] User authenticated by LocalAuthGuard: ${user ? 'Yes' : 'No'}`);
    
    if (user) {
      console.log(`[AuthController] Authenticated user details: ID=${user.id}, Email=${user.email}`);
      const tokens = await this.authService.login(user);
      console.log(`[AuthController] Login successful, tokens generated`);
      return tokens;
    } else {
      console.log(`[AuthController] Authentication failed, no user object provided by guard`);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<Tokens> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  // Debug endpoint - remove in production
  @Public()
  @Post('debug/check-password')
  @ApiOperation({ summary: 'Debug endpoint to check if a password is valid for a user' })
  async checkPassword(@Body() loginDto: LoginDto) {
    console.log(`[DEBUG] Checking password for email: ${loginDto.email}`);
    
    try {
      // Find user by email
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      
      return {
        success: !!user,
        message: user ? 'Password is valid' : 'Password is invalid',
        userId: user?.id
      };
    } catch (error) {
      console.error('[DEBUG] Error checking password:', error);
      return {
        success: false,
        message: 'Error checking password',
        error: error.message
      };
    }
  }
}
