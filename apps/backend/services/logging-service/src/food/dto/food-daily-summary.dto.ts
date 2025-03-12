import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FoodDailySummaryDto {
  @Expose()
  date: string;

  @Expose()
  totalCalories: number;

  @Expose()
  totalProtein: number;

  @Expose()
  totalCarbs: number;

  @Expose()
  totalFat: number;

  @Expose()
  mealCount: number;

  constructor(partial: Partial<FoodDailySummaryDto>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class FoodWeeklySummaryDto {
  @Expose()
  startDate: string;

  @Expose()
  endDate: string;

  @Expose()
  dailySummaries: FoodDailySummaryDto[];

  @Expose()
  averageCalories: number;

  @Expose()
  averageProtein: number;

  @Expose()
  averageCarbs: number;

  @Expose()
  averageFat: number;

  constructor(partial: Partial<FoodWeeklySummaryDto>) {
    Object.assign(this, partial);
  }
}
