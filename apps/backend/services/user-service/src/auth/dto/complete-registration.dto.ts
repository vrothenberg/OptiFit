import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsJSON, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CompleteRegistrationDto {
  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ description: 'User phone number', example: '1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  // Profile fields
  @ApiPropertyOptional({ description: 'User date of birth', example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'User gender', example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'User height in centimeters', example: 180 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  heightCm?: number;

  @ApiPropertyOptional({ description: 'User weight in kilograms', example: 75 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weightKg?: number;

  @ApiPropertyOptional({ description: 'User activity level', example: 'active' })
  @IsOptional()
  @IsString()
  activityLevel?: string;

  @ApiPropertyOptional({ description: 'User age', example: 30 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  age?: number;
}
