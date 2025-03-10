import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsJSON } from 'class-validator';

export class CreateUserActivityLogDto {
  @ApiProperty({
    description: 'The type of event that occurred (e.g. "login", "profile_update", "questionnaire_submission").',
    example: 'login',
  })
  @IsNotEmpty()
  @IsString()
  eventType: string;

  @ApiPropertyOptional({
    description: 'Additional event data provided as a JSON object (e.g. details like IP address, user agent, etc.).',
    example: '{"ip": "192.168.0.1", "userAgent": "Mozilla/5.0"}',
  })
  @IsOptional()
  @IsJSON()
  eventData?: any;
}
