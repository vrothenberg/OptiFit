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
  ExerciseLog,
  ExerciseLogsResponse,
  CreateExerciseLogRequest,
  UpdateExerciseLogRequest,
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
    const response = await apiClient.loggingServiceGet<FoodLogsResponse>('/api/food/logs', { params });
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
    const response = await apiClient.loggingServiceGet<FoodLog>(`/api/food/logs/${id}`);
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
    const response = await apiClient.loggingServicePost<FoodLog>('/api/food/logs', foodData);
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
    const response = await apiClient.loggingServicePatch<FoodLog>(`/api/food/logs/${id}`, foodData);
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
    const response = await apiClient.loggingServiceDelete<SuccessResponse>(`/api/food/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting food log with ID ${id}:`, error);
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
    const response = await apiClient.loggingServiceGet<ExerciseLogsResponse>('/api/exercise/logs', { params });
    return response.data;
  } catch (error) {
    console.error('Error getting exercise logs:', error);
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
    const response = await apiClient.loggingServiceGet<ExerciseLog>(`/api/exercise/logs/${id}`);
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
    const response = await apiClient.loggingServicePost<ExerciseLog>('/api/exercise/logs', exerciseData);
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
    const response = await apiClient.loggingServicePatch<ExerciseLog>(`/api/exercise/logs/${id}`, exerciseData);
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
    const response = await apiClient.loggingServiceDelete<SuccessResponse>(`/api/exercise/logs/${id}`);
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
    const response = await apiClient.loggingServiceGet<SleepLogsResponse>('/api/sleep/logs', { params });
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
    const response = await apiClient.loggingServiceGet<SleepLog>(`/api/sleep/logs/${id}`);
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
    const response = await apiClient.loggingServicePost<SleepLog>('/api/sleep/logs', sleepData);
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
    const response = await apiClient.loggingServicePatch<SleepLog>(`/api/sleep/logs/${id}`, sleepData);
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
    const response = await apiClient.loggingServiceDelete<SuccessResponse>(`/api/sleep/logs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting sleep log with ID ${id}:`, error);
    throw error;
  }
}
