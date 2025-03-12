import { IsNumber, IsString, IsOptional, IsDateString, ValidateNested, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

class GeolocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class UpdateFoodLogDto {
  @IsOptional()
  @IsString()
  foodName?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsDateString()
  time?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeolocationDto)
  geolocation?: GeolocationDto;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
