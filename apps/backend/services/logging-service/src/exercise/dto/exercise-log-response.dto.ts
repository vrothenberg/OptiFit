import { Exclude, Expose, Type } from 'class-transformer';
import { ExerciseLog } from '../entities/exercise-log.entity';

class GeolocationDto {
  latitude: number;
  longitude: number;
}

@Exclude()
export class ExerciseLogResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  name: string;

  @Expose()
  type: string;

  @Expose()
  duration: number;

  @Expose()
  intensity: string;

  @Expose()
  calories: number;

  @Expose()
  time: Date;

  @Expose()
  @Type(() => GeolocationDto)
  geolocation: GeolocationDto | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ExerciseLog>) {
    Object.assign(this, partial);
  }
}
