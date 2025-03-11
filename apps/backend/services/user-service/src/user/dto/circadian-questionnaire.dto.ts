import { IsString, IsOptional, IsArray, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum Chronotype {
  EARLY = 'early',
  INTERMEDIATE = 'intermediate',
  LATE = 'late',
}

export class CircadianQuestionnaireDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '10:30 PM' })
  sleepTime?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '6:30 AM' })
  wakeTime?: string;

  @IsEnum(Chronotype)
  @IsOptional()
  @ApiPropertyOptional({ enum: Chronotype, example: 'intermediate' })
  chronotype?: string;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ example: [3] })
  energyLevels?: number[];

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ example: ['7:30 AM', '7:00 PM'] })
  mealTimes?: string[];

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ example: false })
  fastingPractice?: boolean;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: 3 })
  exerciseFrequency?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Morning' })
  exerciseTime?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Omnivore' })
  dietType?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ example: false })
  supplementUse?: boolean;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ example: ['Improve sleep', 'Optimize meal timing'] })
  goals?: string[];
}
