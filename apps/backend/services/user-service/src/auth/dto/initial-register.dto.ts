import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class InitialRegisterDto {
  @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (will be hashed)', example: 'secret123' })
  @IsString()
  @MinLength(6)
  password: string;
}
