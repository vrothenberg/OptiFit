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
import { FoodService } from './food.service';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';
import { FoodLogResponseDto } from './dto/food-log-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('food')
@ApiBearerAuth()
@Controller('food/logs')
@UseInterceptors(ClassSerializerInterceptor)
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new food log' })
  @ApiResponse({ status: 201, description: 'The food log has been created', type: FoodLogResponseDto })
  create(
    @Body() createFoodLogDto: CreateFoodLogDto,
    @CurrentUser() user: { userId: string },
  ): Promise<FoodLogResponseDto> {
    return this.foodService.create(user.userId, createFoodLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all food logs' })
  @ApiResponse({ status: 200, description: 'Return all food logs', type: [FoodLogResponseDto] })
  findAll(
    @CurrentUser() user: { userId: string },
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    console.log("Get all food logs");
    console.log(user);
    return this.foodService.findAll(
      user.userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a food log by ID' })
  @ApiResponse({ status: 200, description: 'Return the food log', type: FoodLogResponseDto })
  @ApiResponse({ status: 404, description: 'Food log not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<FoodLogResponseDto> {
    return this.foodService.findOne(id, user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a food log' })
  @ApiResponse({ status: 200, description: 'The food log has been updated', type: FoodLogResponseDto })
  @ApiResponse({ status: 404, description: 'Food log not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFoodLogDto: UpdateFoodLogDto,
    @CurrentUser() user: { userId: string },
  ): Promise<FoodLogResponseDto> {
    return this.foodService.update(id, user.userId, updateFoodLogDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a food log' })
  @ApiResponse({ status: 204, description: 'The food log has been deleted' })
  @ApiResponse({ status: 404, description: 'Food log not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<void> {
    return this.foodService.remove(id, user.userId);
  }
}
