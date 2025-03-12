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

    // Convert time string to Date if provided
    if (updateFoodLogDto.time) {
      updateFoodLogDto.time = new Date(updateFoodLogDto.time) as any;
    }

    const updatedFoodLog = await this.foodLogRepository.save({
      ...foodLog,
      ...updateFoodLogDto,
    });

    return plainToInstance(FoodLogResponseDto, updatedFoodLog);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.foodLogRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Food log with ID ${id} not found`);
    }
  }

  // TODO: Add methods for daily and weekly summaries
}
