import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ExerciseLog } from './entities/exercise-log.entity';
import { CreateExerciseLogDto } from './dto/create-exercise-log.dto';
import { UpdateExerciseLogDto } from './dto/update-exercise-log.dto';
import { ExerciseLogResponseDto } from './dto/exercise-log-response.dto';
import { ExerciseDailySummaryDto, ExerciseWeeklySummaryDto } from './dto/exercise-daily-summary.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(ExerciseLog)
    private exerciseLogRepository: Repository<ExerciseLog>,
  ) {}

  async create(userId: string, createExerciseLogDto: CreateExerciseLogDto): Promise<ExerciseLogResponseDto> {
    const exerciseLog = this.exerciseLogRepository.create({
      userId,
      ...createExerciseLogDto,
      time: new Date(createExerciseLogDto.time),
    });

    const savedExerciseLog = await this.exerciseLogRepository.save(exerciseLog);
    return plainToInstance(ExerciseLogResponseDto, savedExerciseLog);
  }

  async findAll(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit = 10,
    offset = 0,
  ): Promise<{ total: number; data: ExerciseLogResponseDto[] }> {
    const whereClause: any = { userId };

    if (startDate && endDate) {
      whereClause.time = Between(startDate, endDate);
    }

    const [exerciseLogs, total] = await this.exerciseLogRepository.findAndCount({
      where: whereClause,
      order: { time: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      total,
      data: plainToInstance(ExerciseLogResponseDto, exerciseLogs),
    };
  }

  async findOne(id: string, userId: string): Promise<ExerciseLogResponseDto> {
    const exerciseLog = await this.exerciseLogRepository.findOne({
      where: { id, userId },
    });

    if (!exerciseLog) {
      throw new NotFoundException(`Exercise log with ID ${id} not found`);
    }

    return plainToInstance(ExerciseLogResponseDto, exerciseLog);
  }

  async update(
    id: string,
    userId: string,
    updateExerciseLogDto: UpdateExerciseLogDto,
  ): Promise<ExerciseLogResponseDto> {
    const exerciseLog = await this.exerciseLogRepository.findOne({
      where: { id, userId },
    });

    if (!exerciseLog) {
      throw new NotFoundException(`Exercise log with ID ${id} not found`);
    }

    // If time is being updated, we need to delete the old record and create a new one
    // because time is part of the primary key
    if (updateExerciseLogDto.time) {
      // Delete the old record
      await this.exerciseLogRepository.delete({ id, userId });

      // Create a new record with the updated time
      // We need to be careful to include all required fields
      const newExerciseLog = this.exerciseLogRepository.create({
        id, // Keep the same ID
        userId,
        name: updateExerciseLogDto.name || exerciseLog.name,
        type: updateExerciseLogDto.type || exerciseLog.type,
        duration: updateExerciseLogDto.duration !== undefined ? updateExerciseLogDto.duration : exerciseLog.duration,
        intensity: updateExerciseLogDto.intensity || exerciseLog.intensity,
        calories: updateExerciseLogDto.calories !== undefined ? updateExerciseLogDto.calories : exerciseLog.calories,
        geolocation: updateExerciseLogDto.geolocation || exerciseLog.geolocation,
        time: new Date(updateExerciseLogDto.time), // Use the new time
        createdAt: exerciseLog.createdAt, // Preserve the original creation time
      });

      const savedExerciseLog = await this.exerciseLogRepository.save(newExerciseLog);
      return plainToInstance(ExerciseLogResponseDto, savedExerciseLog);
    } else {
      // If time is not being updated, we can update the existing record
      // We need to ensure we don't try to update the time field
      const { time, ...updateFields } = updateExerciseLogDto;

      // Update the record
      await this.exerciseLogRepository.update({ id, userId }, updateFields);

      // Fetch the updated record
      const updatedExerciseLog = await this.exerciseLogRepository.findOne({
        where: { id, userId },
      });

      return plainToInstance(ExerciseLogResponseDto, updatedExerciseLog);
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.exerciseLogRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Exercise log with ID ${id} not found`);
    }
  }

  async getDailySummary(userId: string, date: Date): Promise<ExerciseDailySummaryDto> {
    // Create start and end date for the given day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Get all exercise logs for the day
    const exerciseLogs = await this.exerciseLogRepository.find({
      where: {
        userId,
        time: Between(startDate, endDate),
      },
    });
    
    // Calculate totals
    const totalCalories = exerciseLogs.reduce((sum, log) => sum + log.calories, 0);
    const totalDuration = exerciseLogs.reduce((sum, log) => sum + log.duration, 0);
    
    // Create and return the summary
    const summary = new ExerciseDailySummaryDto({
      date: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      totalCalories,
      totalDuration,
      exerciseCount: exerciseLogs.length,
    });
    
    return summary;
  }
  
  async getWeeklySummary(userId: string, startDate: Date): Promise<ExerciseWeeklySummaryDto> {
    // Create start and end date for the week
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6); // 7 days total (including start date)
    end.setHours(23, 59, 59, 999);
    
    // Get daily summaries for each day in the week
    const dailySummaries: ExerciseDailySummaryDto[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(currentDate.getDate() + i);
      const summary = await this.getDailySummary(userId, currentDate);
      dailySummaries.push(summary);
    }
    
    // Calculate averages
    const averageCalories = dailySummaries.reduce((sum, day) => sum + day.totalCalories, 0) / 7;
    const averageDuration = dailySummaries.reduce((sum, day) => sum + day.totalDuration, 0) / 7;
    
    // Create and return the summary
    const summary = new ExerciseWeeklySummaryDto({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      dailySummaries,
      averageCalories,
      averageDuration,
    });
    
    return summary;
  }
  
  async getCurrentDaySummary(userId: string): Promise<ExerciseDailySummaryDto> {
    const today = new Date();
    return this.getDailySummary(userId, today);
  }
  
  async getCurrentWeekSummary(userId: string): Promise<ExerciseWeeklySummaryDto> {
    // Get the start of the current week (Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek); // Go back to Sunday
    
    return this.getWeeklySummary(userId, startOfWeek);
  }
}
