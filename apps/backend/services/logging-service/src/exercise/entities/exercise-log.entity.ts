import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Generated,
} from 'typeorm';

@Entity('exercise_logs')
export class ExerciseLog {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @PrimaryColumn('timestamptz')
  time: Date;

  @Column('text')
  @Index()
  userId: string;

  @Column('text')
  name: string;

  @Column('text')
  type: string;

  @Column('float')
  duration: number;

  @Column('text')
  intensity: string;

  @Column('float')
  calories: number;

  @Column('json', { nullable: true })
  geolocation: { latitude: number; longitude: number } | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
