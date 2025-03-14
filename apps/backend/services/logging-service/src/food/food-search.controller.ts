import {
  Controller,
  Get,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EdamamService } from '../edamam/edamam.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('food-search')
@Controller('food')
@UseInterceptors(ClassSerializerInterceptor)
export class FoodSearchController {
  constructor(private readonly edamamService: EdamamService) {}

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search for food items' })
  @ApiResponse({ status: 200, description: 'Return food search results' })
  async searchFood(@Query('query') query: string) {
    return this.edamamService.searchFoodWithCache(query);
  }

  @Get('autocomplete')
  @Public()
  @ApiOperation({ summary: 'Get autocomplete suggestions for food search' })
  @ApiResponse({ status: 200, description: 'Return autocomplete suggestions' })
  async getAutocompleteSuggestions(@Query('query') query: string) {
    return this.edamamService.getAutocompleteSuggestions(query);
  }

  @Get('nutrition/:foodId')
  @Public()
  @ApiOperation({ summary: 'Get nutrition data for a food item' })
  @ApiResponse({ status: 200, description: 'Return nutrition data' })
  async getNutrition(@Param('foodId') foodId: string) {
    return this.edamamService.getNutritionWithCache(foodId);
  }
  
  @Get('cache/stats')
  @ApiOperation({ summary: 'Get cache statistics' })
  @ApiResponse({ status: 200, description: 'Return cache statistics' })
  async getCacheStats() {
    return this.edamamService.getCacheStats();
  }
}
