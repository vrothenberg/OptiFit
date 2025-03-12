import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ExerciseDailySummaryDto {
  @Expose()
  date: string;

  @Expose()
  totalCalories: number;

  @Expose()
  totalDuration: number;

  @Expose()
  exerciseCount: number;

  constructor(partial: Partial<ExerciseDailySummaryDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class ExerciseWeeklySummaryDto {
  @Expose()
  startDate: string;

  @Expose()
  endDate: string;

  @Expose()
  dailySummaries: ExerciseDailySummaryDto[];

  @Expose()
  averageCalories: number;

  @Expose()
  averageDuration: number;

  constructor(partial: Partial<ExerciseWeeklySummaryDto>) {
    Object.assign(this, partial);
  }
}
