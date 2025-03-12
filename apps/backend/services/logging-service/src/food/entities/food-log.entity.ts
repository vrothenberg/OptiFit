import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Generated,
} from 'typeorm';

@Entity('food_logs')
export class FoodLog {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  id: string;

  @PrimaryColumn('timestamptz')
  time: Date;

  @Column('text')
  @Index()
  userId: string;

  @Column('text')
  foodName: string;

  @Column('float')
  amount: number;

  @Column('text')
  unit: string;

  @Column('float')
  calories: number;

  @Column('float')
  protein: number;

  @Column('float')
  carbs: number;

  @Column('float')
  fat: number;

  @Column('json', { nullable: true })
  geolocation: { latitude: number; longitude: number } | null;

  @Column('text', { nullable: true })
  imageUrl: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
