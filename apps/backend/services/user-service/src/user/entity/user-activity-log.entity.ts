import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';

// Use 'simple-json' for tests (when NODE_ENV === 'test'), otherwise use PostgreSQL's 'jsonb'
const jsonType = process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb';

@Entity({ name: 'user_activity_logs' })
export class UserActivityLog {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: 'Unique identifier for the activity log', example: 1 })
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @ApiProperty({ description: 'The associated user', type: () => User })
  user: User;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  @ApiProperty({
    description: 'Type of event (e.g., "login", "profile_update", "questionnaire_submission")',
    example: 'login',
  })
  eventType: string;

  @Column({ name: 'event_data', type: jsonType, nullable: true })
  @ApiPropertyOptional({
    description: 'Additional event data as JSON',
    example: '{"ip": "192.168.0.1", "userAgent": "Mozilla/5.0"}',
  })
  eventData?: any;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Creation date of the activity log', example: '2025-03-07T00:00:00.000Z' })
  createdAt: Date;
}
