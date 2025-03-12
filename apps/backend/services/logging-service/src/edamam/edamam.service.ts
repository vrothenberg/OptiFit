import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EdamamService {
  private readonly logger = new Logger(EdamamService.name);
  private readonly appId: string;
  private readonly appKey: string;
  private readonly baseUrl = 'https://api.edamam.com/api/food-database/v2';

  constructor(private configService: ConfigService) {
    this.appId = this.configService.get<string>('edamam.appId') || 'your_app_id';
    this.appKey = this.configService.get<string>('edamam.appKey') || 'your_app_key';
  }

  /**
   * Search for food items in the Edamam database
   * @param query Search query
   * @returns Search results
   */
  async searchFood(query: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/parser`, {
        params: {
          app_id: this.appId,
          app_key: this.appKey,
          ingr: query,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error searching for food: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get nutrition data for a food item
   * @param foodId Food ID from Edamam
   * @returns Nutrition data
   */
  async getNutrition(foodId: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/nutrients`,
        {
          ingredients: [
            {
              foodId,
              quantity: 1,
              measureURI: 'http://www.edamam.com/ontologies/edamam.owl#Measure_gram',
            },
          ],
        },
        {
          params: {
            app_id: this.appId,
            app_key: this.appKey,
          },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error getting nutrition data: ${error.message}`, error.stack);
      throw error;
    }
  }
}
