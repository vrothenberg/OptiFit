import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { FoodLog } from './entities/food-log.entity';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';
import { FoodLogResponseDto } from './dto/food-log-response.dto';
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

  // TODO: Add methods for daily and weekly summaries
}
