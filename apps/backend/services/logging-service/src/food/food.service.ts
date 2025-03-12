import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { FoodLog } from './entities/food-log.entity';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';
import { FoodLogResponseDto } from './dto/food-log-response.dto';
import { FoodDailySummaryDto, FoodWeeklySummaryDto } from './dto/food-daily-summary.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(FoodLog)
    private foodLogRepository: Repository<FoodLog>,
  ) {}

  async create(userId: string, createFoodLogDto: CreateFoodLogDto): Promise<FoodLogResponseDto> {
    const foodLog = this.foodLogRepository.create({
      userId,
      ...createFoodLogDto,
      time: new Date(createFoodLogDto.time),
    });

    const savedFoodLog = await this.foodLogRepository.save(foodLog);
    return plainToInstance(FoodLogResponseDto, savedFoodLog);
  }

  async findAll(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit = 10,
    offset = 0,
  ): Promise<{ total: number; data: FoodLogResponseDto[] }> {
    const whereClause: any = { userId };

    if (startDate && endDate) {
      whereClause.time = Between(startDate, endDate);
    }

    const [foodLogs, total] = await this.foodLogRepository.findAndCount({
      where: whereClause,
      order: { time: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      data: plainToInstance(FoodLogResponseDto, foodLogs),
    };
  }

  async findOne(id: string, userId: string): Promise<FoodLogResponseDto> {
    const foodLog = await this.foodLogRepository.findOne({
      where: { id, userId },
    });

    if (!foodLog) {
      throw new NotFoundException(`Food log with ID ${id} not found`);
    }

    return plainToInstance(FoodLogResponseDto, foodLog);
  }

  async update(
    id: string,
    userId: string,
    updateFoodLogDto: UpdateFoodLogDto,
  ): Promise<FoodLogResponseDto> {
    const foodLog = await this.foodLogRepository.findOne({
      where: { id, userId },
    });

    if (!foodLog) {
      throw new NotFoundException(`Food log with ID ${id} not found`);
    }

    // If time is being updated, we need to delete the old record and create a new one
    // because time is part of the primary key
    if (updateFoodLogDto.time) {
      // Delete the old record
      await this.foodLogRepository.delete({ id, userId });

      // Create a new record with the updated time
      // We need to be careful to include all required fields
      const newFoodLog = this.foodLogRepository.create({
        id, // Keep the same ID
        userId,
        foodName: updateFoodLogDto.foodName || foodLog.foodName,
        amount: updateFoodLogDto.amount !== undefined ? updateFoodLogDto.amount : foodLog.amount,
        unit: updateFoodLogDto.unit || foodLog.unit,
        calories: updateFoodLogDto.calories !== undefined ? updateFoodLogDto.calories : foodLog.calories,
        protein: updateFoodLogDto.protein !== undefined ? updateFoodLogDto.protein : foodLog.protein,
        carbs: updateFoodLogDto.carbs !== undefined ? updateFoodLogDto.carbs : foodLog.carbs,
        fat: updateFoodLogDto.fat !== undefined ? updateFoodLogDto.fat : foodLog.fat,
        geolocation: updateFoodLogDto.geolocation || foodLog.geolocation,
        imageUrl: updateFoodLogDto.imageUrl || foodLog.imageUrl,
        time: new Date(updateFoodLogDto.time), // Use the new time
        createdAt: foodLog.createdAt, // Preserve the original creation time
      });

      const savedFoodLog = await this.foodLogRepository.save(newFoodLog);
      return plainToInstance(FoodLogResponseDto, savedFoodLog);
    } else {
      // If time is not being updated, we can update the existing record
      // We need to ensure we don't try to update the time field
      const { time, ...updateFields } = updateFoodLogDto;

      // Update the record
      await this.foodLogRepository.update({ id, userId }, updateFields);

      // Fetch the updated record
      const updatedFoodLog = await this.foodLogRepository.findOne({
        where: { id, userId },
      });

      return plainToInstance(FoodLogResponseDto, updatedFoodLog);
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.foodLogRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Food log with ID ${id} not found`);
    }
  }

  async getDailySummary(userId: string, date: Date): Promise<FoodDailySummaryDto> {
    // Create start and end date for the given day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Get all food logs for the day
    const foodLogs = await this.foodLogRepository.find({
      where: {
        userId,
        time: Between(startDate, endDate),
      },
    });
    
    // Calculate totals
    const totalCalories = foodLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalProtein = foodLogs.reduce((sum, log) => sum + log.protein, 0);
    const totalCarbs = foodLogs.reduce((sum, log) => sum + log.carbs, 0);
    const totalFat = foodLogs.reduce((sum, log) => sum + log.fat, 0);
    
    // Create and return the summary
    const summary = new FoodDailySummaryDto({
      date: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      mealCount: foodLogs.length,
    });
    
    return summary;
  }
  
  async getWeeklySummary(userId: string, startDate: Date): Promise<FoodWeeklySummaryDto> {
    // Create start and end date for the week
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6); // 7 days total (including start date)
    end.setHours(23, 59, 59, 999);
    
    // Get daily summaries for each day in the week
    const dailySummaries: FoodDailySummaryDto[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      const summary = await this.getDailySummary(userId, currentDate);
      dailySummaries.push(summary);
    }
    
    // Calculate averages
    const averageCalories = dailySummaries.reduce((sum, day) => sum + day.totalCalories, 0) / 7;
    const averageProtein = dailySummaries.reduce((sum, day) => sum + day.totalProtein, 0) / 7;
    const averageCarbs = dailySummaries.reduce((sum, day) => sum + day.totalCarbs, 0) / 7;
    const averageFat = dailySummaries.reduce((sum, day) => sum + day.totalFat, 0) / 7;
    
    // Create and return the summary
    const summary = new FoodWeeklySummaryDto({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      dailySummaries,
      averageCalories,
      averageProtein,
      averageCarbs,
      averageFat,
    });
    
    return summary;
  }
  
  async getCurrentDaySummary(userId: string): Promise<FoodDailySummaryDto> {
    const today = new Date();
    return this.getDailySummary(userId, today);
  }
  
  async getCurrentWeekSummary(userId: string): Promise<FoodWeeklySummaryDto> {
    // Get the start of the current week (Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Go back to Sunday
    
    return this.getWeeklySummary(userId, startOfWeek);
  }
}
