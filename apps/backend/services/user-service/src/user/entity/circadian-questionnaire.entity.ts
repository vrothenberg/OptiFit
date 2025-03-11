import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';

// Use 'simple-json' for tests, 'jsonb' for production with PostgreSQL
const jsonType = process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb';

@Entity({ name: 'circadian_questionnaires' })
export class CircadianQuestionnaire {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the questionnaire response', example: 1 })
  id: number;

  @Column({ name: 'user_id' })
  @ApiProperty({ description: 'User ID associated with this questionnaire', example: 1 })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Associated user entity', type: () => User })
  user: User;

  @Column({ name: 'sleep_time', type: 'varchar', length: 20, nullable: true })
  @ApiPropertyOptional({ description: 'Time user typically goes to sleep', example: '10:30 PM' })
  sleepTime?: string;

  @Column({ name: 'wake_time', type: 'varchar', length: 20, nullable: true })
  @ApiPropertyOptional({ description: 'Time user typically wakes up', example: '6:30 AM' })
  wakeTime?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @ApiPropertyOptional({ description: 'User chronotype', example: 'intermediate', enum: ['early', 'intermediate', 'late'] })
  chronotype?: string;

  @Column({ name: 'energy_levels', type: 'integer', array: true, nullable: true })
  @ApiPropertyOptional({ description: 'Energy levels throughout the day', example: [3, 4, 5] })
  energyLevels?: number[];

  @Column({ name: 'meal_times', type: 'varchar', array: true, nullable: true })
  @ApiPropertyOptional({ description: 'Times of day when user typically eats', example: ['7:30 AM', '12:30 PM', '7:00 PM'] })
  mealTimes?: string[];

  @Column({ name: 'fasting_practice', type: 'boolean', nullable: true })
  @ApiPropertyOptional({ description: 'Whether user practices intermittent fasting', example: false })
  fastingPractice?: boolean;

  @Column({ name: 'exercise_frequency', type: 'integer', nullable: true })
  @ApiPropertyOptional({ description: 'Number of days per week user exercises', example: 3 })
  exerciseFrequency?: number;

  @Column({ name: 'exercise_time', type: 'varchar', length: 20, nullable: true })
  @ApiPropertyOptional({ description: 'Time of day user prefers to exercise', example: 'Morning' })
  exerciseTime?: string;

  @Column({ name: 'diet_type', type: 'varchar', length: 50, nullable: true })
  @ApiPropertyOptional({ description: 'Type of diet user follows', example: 'Omnivore' })
  dietType?: string;

  @Column({ name: 'supplement_use', type: 'boolean', nullable: true })
  @ApiPropertyOptional({ description: 'Whether user takes supplements', example: false })
  supplementUse?: boolean;

  @Column({ type: 'varchar', array: true, nullable: true })
  @ApiPropertyOptional({ description: 'User goals', example: ['Improve sleep', 'Optimize meal timing'] })
  goals?: string[];

  @Column({ name: 'additional_data', type: jsonType, nullable: true })
  @ApiPropertyOptional({ description: 'Additional questionnaire data as JSON' })
  additionalData?: any;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Record creation date', example: '2025-03-07T00:00:00.000Z' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Record update date', example: '2025-03-07T00:00:00.000Z' })
  updatedAt: Date;
}
