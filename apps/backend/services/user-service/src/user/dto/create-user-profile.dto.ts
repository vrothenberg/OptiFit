import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString, IsNumber, IsInt, IsJSON, IsArray } from 'class-validator';

export class CreateUserProfileDto {
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
  heightCm?: number;

  @ApiPropertyOptional({ description: 'User weight in kilograms', example: 75 })
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiPropertyOptional({ description: 'User activity level', example: 'active' })
  @IsOptional()
  @IsString()
  activityLevel?: string;

  @ApiPropertyOptional({ description: 'Dietary preferences as JSON', example: '["vegan", "low-carb"]' })
  @IsOptional()
  @IsJSON()
  dietaryPreferences?: any;

  @ApiPropertyOptional({ description: 'Exercise preferences as JSON', example: '["cardio", "strength training"]' })
  @IsOptional()
  @IsJSON()
  exercisePreferences?: any;

  @ApiPropertyOptional({ description: 'Medical conditions', example: '["diabetes", "hypertension"]' })
  @IsOptional()
  @IsArray()
  medicalConditions?: string[];

  @ApiPropertyOptional({ description: 'Supplements info as JSON', example: '{"vitaminD": "2000IU"}' })
  @IsOptional()
  @IsJSON()
  supplements?: any;

  @ApiPropertyOptional({ description: 'Sleep patterns as JSON', example: '{"hours":7, "quality": "good"}' })
  @IsOptional()
  @IsJSON()
  sleepPatterns?: any;

  @ApiPropertyOptional({ description: 'Stress level (1-10)', example: 5 })
  @IsOptional()
  @IsInt()
  stressLevel?: number;

  @ApiPropertyOptional({ description: 'Nutrition info as JSON', example: '{"calories": 2000}' })
  @IsOptional()
  @IsJSON()
  nutritionInfo?: any;

  @ApiPropertyOptional({ description: 'Location as JSON', example: '{"city": "New York", "country": "USA"}' })
  @IsOptional()
  @IsJSON()
  location?: any;

  @ApiPropertyOptional({ description: 'Additional information as JSON', example: '{"notes": "no known allergies"}' })
  @IsOptional()
  @IsJSON()
  additionalInfo?: any;
}
