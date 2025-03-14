/**
 * Logging Service
 * 
 * This file contains functions for interacting with the Logging Service API.
 */

import apiClient from './api/client';
import {
  FoodLog,
  FoodLogsResponse,
  CreateFoodLogRequest,
  UpdateFoodLogRequest,
  FoodDailySummary,
  FoodWeeklySummary,
  ExerciseLog,
  ExerciseLogsResponse,
  CreateExerciseLogRequest,
  UpdateExerciseLogRequest,
  ExerciseDailySummary,
  ExerciseWeeklySummary,
  SleepLog,
  SleepLogsResponse,
  CreateSleepLogRequest,
  UpdateSleepLogRequest,
  DateRangeParams,
  PaginationParams,
  SuccessResponse
} from './api/types';

// Food Logging

/**
 * Get food logs with optional date range and pagination
 * @param params Optional date range and pagination parameters
 * @returns Food logs response
 */
export async function getFoodLogs(params?: DateRangeParams & PaginationParams): Promise<FoodLogsResponse> {
  try {
    const response = await apiClient.loggingServiceGet<FoodLogsResponse>('/food/logs', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting food logs:', error);
    throw error;
  }
}

/**
 * Get a food log by ID
 * @param id Food log ID
 * @returns Food log
 */
export async function getFoodLogById(id: string): Promise<FoodLog> {
  try {
    const response = await apiClient.loggingServiceGet<FoodLog>(`/food/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting food log with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new food log
 * @param foodData Food log data
 * @returns Created food log
 */
export async function createFoodLog(foodData: CreateFoodLogRequest): Promise<FoodLog> {
  try {
    const response = await apiClient.loggingServicePost<FoodLog>('/food/logs', foodData);
    return response.data;
  } catch (error) {
    console.error('Error creating food log:', error);
    throw error;
  }
}

/**
 * Update a food log
 * @param id Food log ID
 * @param foodData Food log data to update
 * @returns Updated food log
 */
export async function updateFoodLog(id: string, foodData: UpdateFoodLogRequest): Promise<FoodLog> {
  try {
    const response = await apiClient.loggingServicePatch<FoodLog>(`/food/logs/${id}`, foodData);
    return response.data;
  } catch (error) {
    console.error(`Error updating food log with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a food log
 * @param id Food log ID
 * @returns Success response
 */
export async function deleteFoodLog(id: string): Promise<SuccessResponse> {
  try {
    const response = await apiClient.loggingServiceDelete<SuccessResponse>(`/food/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting food log with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get daily food summary for a specific date
 * @param date Optional date (defaults to current day if not provided)
 * @returns Daily food summary
 */
export async function getFoodDailySummary(date?: Date): Promise<FoodDailySummary> {
  try {
    const params = date ? { date: date.toISOString() } : undefined;
    const response = await apiClient.loggingServiceGet<FoodDailySummary>('/food/logs/summary/daily', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting daily food summary:', error);
    throw error;
  }
}

/**
 * Get current day's food summary
 * @returns Current day's food summary
 */
export async function getCurrentDayFoodSummary(): Promise<FoodDailySummary> {
  try {
    const response = await apiClient.loggingServiceGet<FoodDailySummary>('/food/logs/summary/current-day');
    return response.data;
  } catch (error) {
    console.error('Error getting current day food summary:', error);
    throw error;
  }
}

/**
 * Get weekly food summary starting from a specific date
 * @param startDate Optional start date (defaults to start of current week if not provided)
 * @returns Weekly food summary
 */
export async function getFoodWeeklySummary(startDate?: Date): Promise<FoodWeeklySummary> {
  try {
    const params = startDate ? { startDate: startDate.toISOString() } : undefined;
    const response = await apiClient.loggingServiceGet<FoodWeeklySummary>('/food/logs/summary/weekly', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting weekly food summary:', error);
    throw error;
  }
}

/**
 * Get current week's food summary
 * @returns Current week's food summary
 */
export async function getCurrentWeekFoodSummary(): Promise<FoodWeeklySummary> {
  try {
    const response = await apiClient.loggingServiceGet<FoodWeeklySummary>('/food/logs/summary/current-week');
    return response.data;
  } catch (error) {
    console.error('Error getting current week food summary:', error);
    throw error;
  }
}

// Food Search

/**
 * Search for food items
 * @param query Search query
 * @returns Food search results
 */
export async function searchFood(query: string): Promise<any> {
  try {
    const response = await apiClient.loggingServiceGet('/food/search', { 
      params: { query } 
    });
    return response.data;
  } catch (error) {
    console.error('Error searching for food:', error);
    throw error;
  }
}

/**
 * Get autocomplete suggestions for food search
 * @param query Search query
 * @returns Autocomplete suggestions
 */
export async function getFoodAutocompleteSuggestions(query: string): Promise<string[]> {
  try {
    const response = await apiClient.loggingServiceGet<string[]>('/food/autocomplete', { 
      params: { query } 
    });
    return response.data;
  } catch (error) {
    console.error('Error getting autocomplete suggestions:', error);
    throw error;
  }
}

/**
 * Get nutrition data for a food item
 * @param foodId Food ID
 * @returns Nutrition data
 */
export async function getFoodNutrition(foodId: string): Promise<any> {
  try {
    const response = await apiClient.loggingServiceGet(`/food/nutrition/${foodId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting nutrition data:', error);
    throw error;
  }
}

// Exercise Logging

/**
 * Get exercise logs with optional date range and pagination
 * @param params Optional date range and pagination parameters
 * @returns Exercise logs response
 */
export async function getExerciseLogs(params?: DateRangeParams & PaginationParams): Promise<ExerciseLogsResponse> {
  try {
    const response = await apiClient.loggingServiceGet<ExerciseLogsResponse>('/exercise/logs', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting exercise logs:', error);
    throw error;
  }
}

/**
 * Get daily exercise summary for a specific date
 * @param date Optional date (defaults to current day if not provided)
 * @returns Daily exercise summary
 */
export async function getExerciseDailySummary(date?: Date): Promise<ExerciseDailySummary> {
  try {
    const params = date ? { date: date.toISOString() } : undefined;
    const response = await apiClient.loggingServiceGet<ExerciseDailySummary>('/exercise/logs/summary/daily', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting daily exercise summary:', error);
    throw error;
  }
}

/**
 * Get current day's exercise summary
 * @returns Current day's exercise summary
 */
export async function getCurrentDayExerciseSummary(): Promise<ExerciseDailySummary> {
  try {
    const response = await apiClient.loggingServiceGet<ExerciseDailySummary>('/exercise/logs/summary/current-day');
    return response.data;
  } catch (error) {
    console.error('Error getting current day exercise summary:', error);
    throw error;
  }
}

/**
 * Get weekly exercise summary starting from a specific date
 * @param startDate Optional start date (defaults to start of current week if not provided)
 * @returns Weekly exercise summary
 */
export async function getExerciseWeeklySummary(startDate?: Date): Promise<ExerciseWeeklySummary> {
  try {
    const params = startDate ? { startDate: startDate.toISOString() } : undefined;
    const response = await apiClient.loggingServiceGet<ExerciseWeeklySummary>('/exercise/logs/summary/weekly', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting weekly exercise summary:', error);
    throw error;
  }
}

/**
 * Get current week's exercise summary
 * @returns Current week's exercise summary
 */
export async function getCurrentWeekExerciseSummary(): Promise<ExerciseWeeklySummary> {
  try {
    const response = await apiClient.loggingServiceGet<ExerciseWeeklySummary>('/exercise/logs/summary/current-week');
    return response.data;
  } catch (error) {
    console.error('Error getting current week exercise summary:', error);
    throw error;
  }
}

/**
 * Get an exercise log by ID
 * @param id Exercise log ID
 * @returns Exercise log
 */
export async function getExerciseLogById(id: string): Promise<ExerciseLog> {
  try {
    const response = await apiClient.loggingServiceGet<ExerciseLog>(`/exercise/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting exercise log with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new exercise log
 * @param exerciseData Exercise log data
 * @returns Created exercise log
 */
export async function createExerciseLog(exerciseData: CreateExerciseLogRequest): Promise<ExerciseLog> {
  try {
    const response = await apiClient.loggingServicePost<ExerciseLog>('/exercise/logs', exerciseData);
    return response.data;
  } catch (error) {
    console.error('Error creating exercise log:', error);
    throw error;
  }
}

/**
 * Update an exercise log
 * @param id Exercise log ID
 * @param exerciseData Exercise log data to update
 * @returns Updated exercise log
 */
export async function updateExerciseLog(id: string, exerciseData: UpdateExerciseLogRequest): Promise<ExerciseLog> {
  try {
    const response = await apiClient.loggingServicePatch<ExerciseLog>(`/exercise/logs/${id}`, exerciseData);
    return response.data;
  } catch (error) {
    console.error(`Error updating exercise log with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete an exercise log
 * @param id Exercise log ID
 * @returns Success response
 */
export async function deleteExerciseLog(id: string): Promise<SuccessResponse> {
  try {
    const response = await apiClient.loggingServiceDelete<SuccessResponse>(`/exercise/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting exercise log with ID ${id}:`, error);
    throw error;
  }
}

// Sleep Logging

/**
 * Get sleep logs with optional date range and pagination
 * @param params Optional date range and pagination parameters
 * @returns Sleep logs response
 */
export async function getSleepLogs(params?: DateRangeParams & PaginationParams): Promise<SleepLogsResponse> {
  try {
    const response = await apiClient.loggingServiceGet<SleepLogsResponse>('/sleep/logs', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting sleep logs:', error);
    throw error;
  }
}

/**
 * Get a sleep log by ID
 * @param id Sleep log ID
 * @returns Sleep log
 */
export async function getSleepLogById(id: string): Promise<SleepLog> {
  try {
    const response = await apiClient.loggingServiceGet<SleepLog>(`/sleep/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting sleep log with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new sleep log
 * @param sleepData Sleep log data
 * @returns Created sleep log
 */
export async function createSleepLog(sleepData: CreateSleepLogRequest): Promise<SleepLog> {
  try {
    const response = await apiClient.loggingServicePost<SleepLog>('/sleep/logs', sleepData);
    return response.data;
  } catch (error) {
    console.error('Error creating sleep log:', error);
    throw error;
  }
}

/**
 * Update a sleep log
 * @param id Sleep log ID
 * @param sleepData Sleep log data to update
 * @returns Updated sleep log
 */
export async function updateSleepLog(id: string, sleepData: UpdateSleepLogRequest): Promise<SleepLog> {
  try {
    const response = await apiClient.loggingServicePatch<SleepLog>(`/sleep/logs/${id}`, sleepData);
    return response.data;
  } catch (error) {
    console.error(`Error updating sleep log with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a sleep log
 * @param id Sleep log ID
 * @returns Success response
 */
export async function deleteSleepLog(id: string): Promise<SuccessResponse> {
  try {
    const response = await apiClient.loggingServiceDelete<SuccessResponse>(`/sleep/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting sleep log with ID ${id}:`, error);
    throw error;
  }
}
