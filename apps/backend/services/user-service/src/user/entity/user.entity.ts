import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserProfile } from './user-profile.entity';

@Entity()
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
  @ApiProperty({ example: '1234567890', description: 'The user’s phone number.', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ example: true, description: 'Flag indicating whether the user is active.' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({ description: 'Creation date of the user record.' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({ description: 'Last update date of the user record.' })
  updatedAt: Date;

  // Inverse side of the relation
  @OneToOne(() => UserProfile, profile => profile.user, { cascade: true })
  @ApiProperty({ type: () => UserProfile, description: 'The profile details of the user.' })
  profile: UserProfile;
}
