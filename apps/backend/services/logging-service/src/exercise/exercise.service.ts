import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ExerciseLog } from './entities/exercise-log.entity';
import { CreateExerciseLogDto } from './dto/create-exercise-log.dto';
import { UpdateExerciseLogDto } from './dto/update-exercise-log.dto';
import { ExerciseLogResponseDto } from './dto/exercise-log-response.dto';
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

  // TODO: Add methods for daily and weekly summaries
}
