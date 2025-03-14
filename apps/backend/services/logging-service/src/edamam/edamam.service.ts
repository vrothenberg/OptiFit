import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import axios from 'axios';
import { FoodCache } from './entities/food-cache.entity';
import { SearchTermCache } from './entities/search-term-cache.entity';

@Injectable()
export class EdamamService {
  private readonly logger = new Logger(EdamamService.name);
  private readonly appId: string;
  private readonly appKey: string;
  private readonly foodAppId: string;
  private readonly foodAppKey: string;
  private readonly baseUrl = 'https://api.edamam.com/api/food-database/v2';

  constructor(
    private configService: ConfigService,
    @InjectRepository(FoodCache)
    private foodCacheRepository: Repository<FoodCache>,
    @InjectRepository(SearchTermCache)
    private searchTermCacheRepository: Repository<SearchTermCache>
  ) {
    // Legacy keys (fallback)
    this.appId = this.configService.get<string>('edamam.appId') || '';
    this.appKey = this.configService.get<string>('edamam.appKey') || '';
    
    // Food API keys - use these for all food database endpoints
    this.foodAppId = this.configService.get<string>('edamam.food.appId') || this.appId;
    this.foodAppKey = this.configService.get<string>('edamam.food.appKey') || this.appKey;
    
    this.logger.log(`Edamam Food API configured with app ID: ${this.foodAppId}`);
  }

  /**
   * Search for food items in the Edamam database with caching
   * @param query Search query
   * @returns Search results
   */
  async searchFoodWithCache(query: string) {
    // Normalize the query
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check cache first
    const cachedSearch = await this.searchTermCacheRepository.findOne({
      where: { searchTerm: normalizedQuery }
    });
    
    if (cachedSearch) {
      this.logger.log(`Cache hit for search term: ${normalizedQuery}`);
      
      // Update usage statistics
      cachedSearch.lastUsed = new Date();
      cachedSearch.usageCount += 1;
      await this.searchTermCacheRepository.save(cachedSearch);
      
      // Fetch cached food items
      const cachedFoods = await this.foodCacheRepository.findBy({
        foodId: In(cachedSearch.foodIds)
      });
      
      return this.formatCachedResults(cachedFoods);
    }
    
    // If not in cache, fetch from API
    this.logger.log(`Cache miss for search term: ${normalizedQuery}, fetching from API`);
    const apiResults = await this.searchFood(normalizedQuery);
    
    // Cache results
    await this.cacheSearchResults(normalizedQuery, apiResults);
    
    return apiResults;
  }

  /**
   * Get autocomplete suggestions for food search
   * @param query Search query
   * @returns Array of food name suggestions
   */
  async getAutocompleteSuggestions(query: string): Promise<string[]> {
    // Normalize the query
    const normalizedQuery = query.toLowerCase().trim();
    
    if (normalizedQuery.length < 2) {
      return [];
    }
    
    // Search for terms that start with the query
    const searchTerms = await this.searchTermCacheRepository.find();
    
    // Filter terms that start with the query
    const matchingTerms = searchTerms
      .filter(term => term.searchTerm.startsWith(normalizedQuery))
      .sort((a, b) => b.usageCount - a.usageCount) // Sort by usage count
      .slice(0, 10) // Limit to 10 results
      .map(term => term.searchTerm);
    
    // If we have enough matching terms, return them
    if (matchingTerms.length >= 5) {
      return matchingTerms;
    }
    
    // Otherwise, search for food names that contain the query
    const foodItems = await this.foodCacheRepository
      .createQueryBuilder('food')
      .where('LOWER(food.foodName) LIKE :query', { query: `%${normalizedQuery}%` })
      .orderBy('food.usageCount', 'DESC')
      .take(10 - matchingTerms.length)
      .getMany();
    
    // Extract food names and combine with matching terms
    const foodNames = foodItems.map(food => food.foodName.toLowerCase());
    
    // Combine and deduplicate
    return [...new Set([...matchingTerms, ...foodNames])];
  }

  /**
   * Get nutrition data for a food item with caching
   * @param foodId Food ID from Edamam
   * @returns Nutrition data
   */
  async getNutritionWithCache(foodId: string) {
    try {
      this.logger.log(`Getting nutrition data for food ID: ${foodId}`);
      
      // Check cache first
      const cachedFood = await this.foodCacheRepository.findOne({
        where: { foodId }
      });
      
      if (cachedFood && cachedFood.fullDetails) {
        this.logger.log(`Cache hit for food ID: ${foodId}`);
        
        // Update usage statistics
        cachedFood.lastUsed = new Date();
        cachedFood.usageCount += 1;
        
        // Mark as having full details
        if (!cachedFood.hasFullDetails) {
          cachedFood.hasFullDetails = true;
        }
        
        await this.foodCacheRepository.save(cachedFood);
        
        return cachedFood.fullDetails;
      }
      
      // If not in cache or missing full details, fetch from API
      this.logger.log(`Cache miss for food ID: ${foodId}, fetching from API`);
      this.logger.log(`Using Food API ID: ${this.foodAppId}, Key: ${this.foodAppKey.substring(0, 5)}...`);
      
      const apiResults = await this.getNutrition(foodId);
      
      // Cache results
      if (cachedFood) {
        // Update existing food cache entry with nutrition data
        cachedFood.fullDetails = apiResults;
        cachedFood.lastUsed = new Date();
        cachedFood.usageCount += 1;
        cachedFood.hasFullDetails = true;
        cachedFood.lastApiUpdate = new Date();
        
        // Extract and update health and diet labels if available
        if (apiResults.healthLabels) {
          cachedFood.healthLabels = apiResults.healthLabels;
        }
        
        if (apiResults.dietLabels) {
          cachedFood.dietLabels = apiResults.dietLabels;
        }
        
        // Update nutrients if they're more complete
        if (apiResults.totalNutrients && Object.keys(apiResults.totalNutrients).length > Object.keys(cachedFood.nutrients || {}).length) {
          const nutrients: Record<string, number> = {};
          for (const [key, value] of Object.entries(apiResults.totalNutrients)) {
            if (value && typeof value === 'object' && 'quantity' in value && typeof value.quantity === 'number') {
              nutrients[key] = value.quantity;
            }
          }
          cachedFood.nutrients = nutrients;
        }
        
        await this.foodCacheRepository.save(cachedFood);
        this.logger.log(`Updated existing food cache entry with nutrition data for: ${cachedFood.foodName} (${foodId})`);
      } else {
        // This should rarely happen as we typically cache food items during search
        this.logger.log(`Creating new cache entry for food ID: ${foodId}`);
        
        // Extract food name and nutrients from the nutrition response
        const foodName = apiResults.ingredients?.[0]?.parsed?.[0]?.food || 'Unknown Food';
        const nutrients: Record<string, number> = {};
        
        if (apiResults.totalNutrients) {
          for (const [key, value] of Object.entries(apiResults.totalNutrients)) {
            if (value && typeof value === 'object' && 'quantity' in value && typeof value.quantity === 'number') {
              nutrients[key] = value.quantity;
            }
          }
        }
        
        const newFoodCache = this.foodCacheRepository.create({
          foodId,
          foodName,
          nutrients,
          measures: [],
          fullDetails: apiResults,
          lastUsed: new Date(),
          hasFullDetails: true,
          healthLabels: apiResults.healthLabels || [],
          dietLabels: apiResults.dietLabels || [],
          lastApiUpdate: new Date()
        });
        
        await this.foodCacheRepository.save(newFoodCache);
        this.logger.log(`Created new food cache entry with nutrition data for: ${foodName} (${foodId})`);
      }
      
      return apiResults;
    } catch (error) {
      this.logger.error(`Error in getNutritionWithCache for food ID ${foodId}: ${error.message}`, error.stack);
      if (axios.isAxiosError(error)) {
        this.logger.error(`Axios error details: ${JSON.stringify(error.response?.data || {})}`);
      }
      throw error;
    }
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
          app_id: this.foodAppId,
          app_key: this.foodAppKey,
          ingr: query,
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(`Error searching for food: ${error.message}`, error.stack);
      if (axios.isAxiosError(error)) {
        this.logger.error(`Axios error details: ${JSON.stringify(error.response?.data || {})}`);
      }
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
      this.logger.log(`Making nutrition API request for food ID: ${foodId}`);
      
      const requestBody = {
        ingredients: [
          {
            foodId,
            quantity: 1,
            measureURI: 'http://www.edamam.com/ontologies/edamam.owl#Measure_gram',
          },
        ],
      };
      
      this.logger.log(`Request body: ${JSON.stringify(requestBody)}`);
      
      const response = await axios.post(
        `${this.baseUrl}/nutrients`,
        requestBody,
        {
          params: {
            app_id: this.foodAppId,
            app_key: this.foodAppKey,
          },
        },
      );
      
      this.logger.log(`Nutrition API response received for food ID: ${foodId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error getting nutrition data for food ID ${foodId}: ${error.message}`, error.stack);
      if (axios.isAxiosError(error)) {
        this.logger.error(`Axios error details: ${JSON.stringify(error.response?.data || {})}`);
        this.logger.error(`Request config: ${JSON.stringify(error.config || {})}`);
      }
      throw error;
    }
  }

  /**
   * Cache search results
   * @param query Search query
   * @param results API results
   */
  private async cacheSearchResults(query: string, results: any): Promise<void> {
    try {
      // Extract food items to cache
      const foodItems = results.hints.map((hint: any) => hint.food);
      const foodIds: string[] = [];
      
      this.logger.log(`Caching ${foodItems.length} food items from search results for query: ${query}`);
      
      // Cache each food item
      for (const food of foodItems) {
        // Skip if no foodId
        if (!food.foodId) {
          this.logger.warn(`Skipping food item without foodId: ${JSON.stringify(food)}`);
          continue;
        }
        
        // Check if food already exists in cache
        const existingFood = await this.foodCacheRepository.findOne({
          where: { foodId: food.foodId }
        });
        
        if (existingFood) {
          // Update existing food with any new information
          existingFood.lastUsed = new Date();
          existingFood.usageCount += 1;
          
          // Update fields that might have changed
          if (food.label) existingFood.foodName = food.label;
          if (food.knownAs) existingFood.knownAs = food.knownAs;
          if (food.category) existingFood.category = food.category;
          if (food.categoryLabel) existingFood.categoryLabel = food.categoryLabel;
          if (food.image) existingFood.imageUrl = food.image;
          if (food.nutrients) existingFood.nutrients = food.nutrients;
          
          // Update new fields
          if (food.brand) existingFood.brand = food.brand;
          if (food.foodContentsLabel) existingFood.foodContentsLabel = food.foodContentsLabel;
          if (food.servingSizes) existingFood.servingSizes = food.servingSizes;
          if (food.healthLabels) existingFood.healthLabels = food.healthLabels;
          if (food.dietLabels) existingFood.dietLabels = food.dietLabels;
          if (food.upc) existingFood.upc = food.upc;
          
          // Update measures
          const measures = results.hints.find((h: any) => h.food.foodId === food.foodId)?.measures;
          if (measures && measures.length > 0) {
            existingFood.measures = measures;
            
            // Extract qualifiers if available
            const qualifiers = measures.filter(m => m.qualified).map(m => m.qualified);
            if (qualifiers.length > 0) {
              existingFood.qualifiers = qualifiers;
            }
          }
          
          existingFood.lastApiUpdate = new Date();
          
          await this.foodCacheRepository.save(existingFood);
          this.logger.log(`Updated existing food cache entry for: ${food.label} (${food.foodId})`);
        } else {
          // Create new food cache entry with all available information
          const foodCache = this.foodCacheRepository.create({
            foodId: food.foodId,
            foodName: food.label,
            knownAs: food.knownAs,
            category: food.category,
            categoryLabel: food.categoryLabel,
            imageUrl: food.image,
            nutrients: food.nutrients || {},
            measures: results.hints.find((h: any) => h.food.foodId === food.foodId)?.measures || [],
            fullDetails: null, // We'll fetch this separately when needed
            lastUsed: new Date(),
            
            // New fields
            brand: food.brand,
            foodContentsLabel: food.foodContentsLabel,
            servingSizes: food.servingSizes,
            healthLabels: food.healthLabels,
            dietLabels: food.dietLabels,
            upc: food.upc,
            hasFullDetails: false,
            lastApiUpdate: new Date()
          });
          
          // Extract qualifiers if available
          const measures = results.hints.find((h: any) => h.food.foodId === food.foodId)?.measures;
          if (measures && measures.length > 0) {
            const qualifiers = measures.filter(m => m.qualified).map(m => m.qualified);
            if (qualifiers.length > 0) {
              foodCache.qualifiers = qualifiers;
            }
          }
          
          await this.foodCacheRepository.save(foodCache);
          this.logger.log(`Created new food cache entry for: ${food.label} (${food.foodId})`);
        }
        
        foodIds.push(food.foodId);
      }
      
      // Skip if no food IDs
      if (foodIds.length === 0) {
        this.logger.warn(`No valid food items found in search results for query: ${query}`);
        return;
      }
      
      // Cache search term
      const existingSearchTerm = await this.searchTermCacheRepository.findOne({
        where: { searchTerm: query.toLowerCase() }
      });
      
      if (existingSearchTerm) {
        // Update existing search term
        existingSearchTerm.lastUsed = new Date();
        existingSearchTerm.usageCount += 1;
        
        // Combine existing and new food IDs, removing duplicates
        const combinedFoodIds = Array.from(new Set([...existingSearchTerm.foodIds, ...foodIds]));
        existingSearchTerm.foodIds = combinedFoodIds;
        
        await this.searchTermCacheRepository.save(existingSearchTerm);
        this.logger.log(`Updated existing search term cache entry for: ${query.toLowerCase()}`);
      } else {
        // Create new search term cache entry
        const searchCache = this.searchTermCacheRepository.create({
          searchTerm: query.toLowerCase(),
          foodIds,
          lastUsed: new Date()
        });
        
        await this.searchTermCacheRepository.save(searchCache);
        this.logger.log(`Created new search term cache entry for: ${query.toLowerCase()}`);
      }
    } catch (error) {
      this.logger.error(`Error caching search results: ${error.message}`, error.stack);
      // Don't throw the error, just log it - we don't want to fail the search if caching fails
    }
  }

  /**
   * Format cached results to match API response format
   * @param cachedFoods Cached food items
   * @returns Formatted results
   */
  private formatCachedResults(cachedFoods: FoodCache[]): any {
    const hints = cachedFoods.map(food => {
      // Create a food object with all available information
      const foodObject: any = {
        foodId: food.foodId,
        label: food.foodName,
        knownAs: food.knownAs,
        category: food.category,
        categoryLabel: food.categoryLabel,
        image: food.imageUrl,
        nutrients: food.nutrients
      };
      
      // Add additional fields if available
      if (food.brand) foodObject.brand = food.brand;
      if (food.foodContentsLabel) foodObject.foodContentsLabel = food.foodContentsLabel;
      if (food.servingSizes) foodObject.servingSizes = food.servingSizes;
      if (food.healthLabels) foodObject.healthLabels = food.healthLabels;
      if (food.dietLabels) foodObject.dietLabels = food.dietLabels;
      if (food.upc) foodObject.upc = food.upc;
      
      return {
        food: foodObject,
        measures: food.measures
      };
    });
    
    return {
      text: '',
      parsed: hints.length > 0 ? [hints[0]] : [], // Use the first hint as the parsed result
      hints
    };
  }
  
  /**
   * Get cache statistics
   * @returns Statistics about the cache
   */
  async getCacheStats() {
    const foodCount = await this.foodCacheRepository.count();
    const searchTermCount = await this.searchTermCacheRepository.count();
    
    const foodWithFullDetails = await this.foodCacheRepository.count({
      where: { hasFullDetails: true }
    });
    
    const mostUsedFoods = await this.foodCacheRepository.find({
      order: { usageCount: 'DESC' },
      take: 10
    });
    
    const mostUsedSearchTerms = await this.searchTermCacheRepository.find({
      order: { usageCount: 'DESC' },
      take: 10
    });
    
    return {
      foodCount,
      searchTermCount,
      foodWithFullDetails,
      cacheHitRate: {
        food: foodWithFullDetails / foodCount,
      },
      mostUsedFoods: mostUsedFoods.map(f => ({
        foodId: f.foodId,
        foodName: f.foodName,
        usageCount: f.usageCount
      })),
      mostUsedSearchTerms: mostUsedSearchTerms.map(s => ({
        searchTerm: s.searchTerm,
        usageCount: s.usageCount
      }))
    };
  }
}
