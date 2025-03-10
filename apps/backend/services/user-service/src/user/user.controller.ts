import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UsePipes, UseGuards, Logger, ValidationPipe } from '@nestjs/common';
import { CustomValidationPipe } from '../common/pipes/validation.pipe';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { User } from './entity/user.entity';
import { UserProfile } from './entity/user-profile.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator'; // Add this import

@UseGuards(JwtAuthGuard)
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  @UsePipes(new CustomValidationPipe())
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.', type: User })
  @ApiResponse({ status: 400, description: 'Validation failed or Bad Request' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      const logger = new Logger('UserController');
      logger.debug(`Creating user with email: ${createUserDto.email}`);
      return await this.userService.create(createUserDto);
    } catch (error) {
      const logger = new Logger('UserController');
      logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns an array of users.', type: [User] })
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Returns a user with the specified id.', type: User })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new CustomValidationPipe())
  @ApiOperation({ summary: 'Update user by id' })
  @ApiResponse({ status: 200, description: 'The user has been updated.', type: User })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiResponse({ status: 200, description: 'The user has been deleted.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.userService.remove(id);
  }

  // PROFILE ENDPOINTS

  @Get('profile/:userId')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Returns the profile of the specified user.', type: UserProfile })
  async getProfile(@Param('userId', ParseIntPipe) userId: number): Promise<UserProfile> {
    return await this.userService.getUserProfile(userId);
  }

  @Put('profile/:userId')
  @UsePipes(new CustomValidationPipe())
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'The user profile has been updated.', type: UserProfile })
  async updateProfile(@Param('userId', ParseIntPipe) userId: number, @Body() updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfile> {
    return await this.userService.updateUserProfile(userId, updateUserProfileDto);
  }
}
