import { Exclude, Expose, Type } from 'class-transformer';
import { FoodLog } from '../entities/food-log.entity';

class GeolocationDto {
  latitude: number;
  longitude: number;
}

@Exclude()
export class FoodLogResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  foodName: string;

  @Expose()
  amount: number;

  @Expose()
  unit: string;

  @Expose()
  calories: number;

  @Expose()
  protein: number;

  @Expose()
  carbs: number;

  @Expose()
  fat: number;

  @Expose()
  time: Date;

  @Expose()
  @Type(() => GeolocationDto)
  geolocation: GeolocationDto | null;

  @Expose()
  imageUrl: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<FoodLog>) {
    Object.assign(this, partial);
  }
}
