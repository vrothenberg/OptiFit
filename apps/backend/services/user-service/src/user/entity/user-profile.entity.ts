import { Entity, PrimaryColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';

// Use 'simple-json' for tests, 'jsonb' for production with PostgreSQL
const jsonType = process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb';

@Entity({ name: 'user_profiles' })
export class UserProfile {
  @PrimaryColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Unique identifier for the user (and profile)', example: 1 })
  userId: number;

  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Associated user entity', type: () => User })
  user: User;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  @ApiPropertyOptional({ description: 'User date of birth', example: '1990-01-01' })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @ApiPropertyOptional({ description: 'User gender', example: 'male' })
  gender?: string;

  @Column({ name: 'height_cm', type: 'numeric', precision: 5, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'User height in centimeters', example: 180 })
  heightCm?: number;

  @Column({ name: 'weight_kg', type: 'numeric', precision: 6, scale: 2, nullable: true })
  @ApiPropertyOptional({ description: 'User weight in kilograms', example: 75 })
  weightKg?: number;

  @Column({ name: 'activity_level', type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'User activity level', example: 'active' })
  activityLevel?: string;

  @Column({ name: 'dietary_preferences', type: jsonType, nullable: true })
  @ApiPropertyOptional({ description: 'User dietary preferences', example: '["vegan", "low-carb"]' })
  dietaryPreferences?: any;

  @Column({ name: 'exercise_preferences', type: jsonType, nullable: true })
  @ApiPropertyOptional({ description: 'User exercise preferences', example: '["cardio", "strength training"]' })
  exercisePreferences?: any;

  @Column({ name: 'medical_conditions', type: 'text', array: true, nullable: true })
  @ApiPropertyOptional({ description: 'Array of user medical conditions', example: '["diabetes", "hypertension"]' })
  medicalConditions?: string[];

  @Column({ type: jsonType, nullable: true })
  @ApiPropertyOptional({ description: 'User supplements information as JSON', example: '{"vitaminD": "2000IU"}' })
  supplements?: any;

  @Column({ name: 'sleep_patterns', type: jsonType, nullable: true })
  @ApiPropertyOptional({ description: 'User sleep patterns as JSON', example: '{"hours": 7, "quality": "good"}' })
  sleepPatterns?: any;

  @Column({ name: 'stress_level', type: 'integer', nullable: true })
  @ApiPropertyOptional({ description: 'User stress level on a scale (1-10)', example: 5 })
  stressLevel?: number;

  @Column({ name: 'nutrition_info', type: jsonType, nullable: true })
  @ApiPropertyOptional({ description: 'User nutrition information as JSON', example: '{"calories": 2000}' })
  nutritionInfo?: any;

  @Column({ type: jsonType, nullable: true })
  @ApiPropertyOptional({ description: 'User location as JSON', example: '{"city": "New York", "country": "USA"}' })
  location?: any;

  @Column({ name: 'additional_info', type: jsonType, nullable: true })
  @ApiPropertyOptional({ description: 'Additional information as JSON', example: '{"notes": "no known allergies"}' })
  additionalInfo?: any;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Record creation date', example: '2025-03-07T00:00:00.000Z' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Record update date', example: '2025-03-07T00:00:00.000Z' })
  updatedAt: Date;
}
