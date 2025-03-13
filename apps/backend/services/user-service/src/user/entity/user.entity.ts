import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Use 'simple-json' for tests, 'jsonb' for production with PostgreSQL
const jsonType = process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: 'The unique identifier of the user.' })
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  @ApiProperty({ example: 'John', description: 'The first name of the user.' })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  @ApiProperty({ example: 'Doe', description: 'The last name of the user.' })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @ApiProperty({ example: 'john.doe@example.com', description: 'The email address of the user.' })
  email: string;

  @Column({ name: 'hashed_password', type: 'varchar', length: 255 })
  @ApiProperty({ example: 'hashedSecret', description: 'The hashed password of the user.' })
  hashedPassword: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 50, nullable: true })
  @ApiProperty({ example: '1234567890', description: 'The user phone number.', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ example: true, description: 'Flag indicating whether the user is active.' })
  isActive: boolean;

  // Profile fields (merged from UserProfile)
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

  @Column({ name: 'supplements', type: jsonType, nullable: true })
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

  @Column({ name: 'location', type: jsonType, nullable: true })
  @ApiPropertyOptional({ description: 'User location as JSON', example: '{"city": "New York", "country": "USA"}' })
  location?: any;

  @Column({ name: 'additional_info', type: jsonType, nullable: true })
  @ApiPropertyOptional({ description: 'Additional information as JSON', example: '{"notes": "no known allergies"}' })
  additionalInfo?: any;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Creation date of the user record.' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Last update date of the user record.' })
  updatedAt: Date;

  // Day streak tracking fields
  @Column({ name: 'current_streak', default: 0 })
  @ApiPropertyOptional({ description: 'Current consecutive days streak', example: 5 })
  currentStreak: number;

  @Column({ name: 'last_active_date', type: 'date', nullable: true })
  @ApiPropertyOptional({ description: 'Date of last user activity', example: '2025-03-12' })
  lastActiveDate: Date;

  @Column({ name: 'max_streak', default: 0 })
  @ApiPropertyOptional({ description: 'Maximum streak achieved by the user', example: 10 })
  maxStreak: number;
}
