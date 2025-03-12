import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { CreateExerciseLogDto } from './dto/create-exercise-log.dto';
import { UpdateExerciseLogDto } from './dto/update-exercise-log.dto';
import { ExerciseLogResponseDto } from './dto/exercise-log-response.dto';
import { ExerciseDailySummaryDto, ExerciseWeeklySummaryDto } from './dto/exercise-daily-summary.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('exercise')
@ApiBearerAuth()
@Controller('exercise/logs')
@UseInterceptors(ClassSerializerInterceptor)
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exercise log' })
  @ApiResponse({ status: 201, description: 'The exercise log has been created', type: ExerciseLogResponseDto })
  create(
    @Body() createExerciseLogDto: CreateExerciseLogDto,
    @CurrentUser() user: { userId: string },
  ): Promise<ExerciseLogResponseDto> {
    return this.exerciseService.create(user.userId, createExerciseLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all exercise logs' })
  @ApiResponse({ status: 200, description: 'Return all exercise logs', type: [ExerciseLogResponseDto] })
  findAll(
    @CurrentUser() user: { userId: string },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.exerciseService.findAll(
      user.userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exercise log by ID' })
  @ApiResponse({ status: 200, description: 'Return the exercise log', type: ExerciseLogResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise log not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<ExerciseLogResponseDto> {
    return this.exerciseService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an exercise log' })
  @ApiResponse({ status: 200, description: 'The exercise log has been updated', type: ExerciseLogResponseDto })
  @ApiResponse({ status: 404, description: 'Exercise log not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExerciseLogDto: UpdateExerciseLogDto,
    @CurrentUser() user: { userId: string },
  ): Promise<ExerciseLogResponseDto> {
    return this.exerciseService.update(id, user.userId, updateExerciseLogDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an exercise log' })
  @ApiResponse({ status: 204, description: 'The exercise log has been deleted' })
  @ApiResponse({ status: 404, description: 'Exercise log not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    return this.exerciseService.remove(id, user.userId);
  }

  @Get('summary/daily')
  @ApiOperation({ summary: 'Get daily exercise summary' })
  @ApiResponse({ status: 200, description: 'Return daily exercise summary', type: ExerciseDailySummaryDto })
  getDailySummary(
    @CurrentUser() user: { userId: string },
    @Query('date') date?: string,
  ): Promise<ExerciseDailySummaryDto> {
    const summaryDate = date ? new Date(date) : new Date();
    return this.exerciseService.getDailySummary(user.userId, summaryDate);
  }

  @Get('summary/current-day')
  @ApiOperation({ summary: 'Get current day exercise summary' })
  @ApiResponse({ status: 200, description: 'Return current day exercise summary', type: ExerciseDailySummaryDto })
  getCurrentDaySummary(
    @CurrentUser() user: { userId: string },
  ): Promise<ExerciseDailySummaryDto> {
    return this.exerciseService.getCurrentDaySummary(user.userId);
  }

  @Get('summary/weekly')
  @ApiOperation({ summary: 'Get weekly exercise summary' })
  @ApiResponse({ status: 200, description: 'Return weekly exercise summary', type: ExerciseWeeklySummaryDto })
  getWeeklySummary(
    @CurrentUser() user: { userId: string },
    @Query('startDate') startDate?: string,
  ): Promise<ExerciseWeeklySummaryDto> {
    const summaryStartDate = startDate ? new Date(startDate) : undefined;
    return summaryStartDate 
      ? this.exerciseService.getWeeklySummary(user.userId, summaryStartDate)
      : this.exerciseService.getCurrentWeekSummary(user.userId);
  }

  @Get('summary/current-week')
  @ApiOperation({ summary: 'Get current week exercise summary' })
  @ApiResponse({ status: 200, description: 'Return current week exercise summary', type: ExerciseWeeklySummaryDto })
  getCurrentWeekSummary(
    @CurrentUser() user: { userId: string },
  ): Promise<ExerciseWeeklySummaryDto> {
    return this.exerciseService.getCurrentWeekSummary(user.userId);
  }
}
