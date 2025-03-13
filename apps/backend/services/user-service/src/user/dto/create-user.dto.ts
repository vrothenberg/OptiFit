import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, ValidateNested, IsNumber, IsDate, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (will be hashed)', example: 'secret123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ description: 'User phone number', example: '1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  // Profile fields (merged from UserProfile)
  @ApiPropertyOptional({ description: 'User date of birth', example: '1990-01-01' })
  @IsOptional()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'User gender', example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'User height in centimeters', example: 180 })
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @ApiPropertyOptional({ description: 'User weight in kilograms', example: 75 })
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional({ description: 'User activity level', example: 'active' })
  @IsOptional()
  @IsString()
  activityLevel?: string;

  @ApiPropertyOptional({ description: 'User dietary preferences', example: ['vegan', 'low-carb'] })
  @IsOptional()
  dietaryPreferences?: any;

  @ApiPropertyOptional({ description: 'User exercise preferences', example: ['cardio', 'strength training'] })
  @IsOptional()
  exercisePreferences?: any;

  @ApiPropertyOptional({ description: 'Array of user medical conditions', example: ['diabetes', 'hypertension'] })
  @IsOptional()
  @IsArray()
  medicalConditions?: string[];

  @ApiPropertyOptional({ description: 'User supplements information', example: { vitaminD: '2000IU' } })
  @IsOptional()
  supplements?: any;

  @ApiPropertyOptional({ description: 'User sleep patterns', example: { hours: 7, quality: 'good' } })
  @IsOptional()
  sleepPatterns?: any;

  @ApiPropertyOptional({ description: 'User stress level on a scale (1-10)', example: 5 })
  @IsOptional()
  @IsNumber()
  stressLevel?: number;

  @ApiPropertyOptional({ description: 'User nutrition information', example: { calories: 2000 } })
  @IsOptional()
  nutritionInfo?: any;

  @ApiPropertyOptional({ description: 'User location', example: { city: 'New York', country: 'USA' } })
  @IsOptional()
  location?: any;

  @ApiPropertyOptional({ description: 'Additional information', example: { notes: 'no known allergies' } })
  @IsOptional()
  additionalInfo?: any;
}
