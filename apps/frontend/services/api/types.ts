/**
 * API Types
 * 
 * This file contains TypeScript interfaces for API requests and responses.
 */

// Common API response structure
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

// Error response from the API
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// Authentication

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  profile?: {
    gender?: string;
    dateOfBirth?: string;
    activityLevel?: string;
  };
}

// User

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  // Profile fields merged into User
  dateOfBirth?: string;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: string;
  dietaryPreferences?: any;
  exercisePreferences?: any;
  medicalConditions?: string[];
  supplements?: any;
  sleepPatterns?: any;
  stressLevel?: number;
  nutritionInfo?: any;
  location?: any;
  additionalInfo?: any;
  createdAt: string;
  updatedAt: string;
  // Keep profile for backward compatibility
  profile?: UserProfile;
}

// Kept for backward compatibility
export interface UserProfile {
  userId: number;
  dateOfBirth?: string;
  gender?: string;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: string;
  dietaryPreferences?: any;
  exercisePreferences?: any;
  medicalConditions?: string[];
  supplements?: any;
  sleepPatterns?: any;
  stressLevel?: number;
  nutritionInfo?: any;
  location?: any;
  additionalInfo?: any;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  darkMode?: boolean;
  notifications?: boolean;
  units?: 'metric' | 'imperial';
  [key: string]: any;
}

export interface CircadianQuestionnaire {
  sleepTime?: string;
  wakeTime?: string;
  chronotype?: 'early' | 'intermediate' | 'late';
  energyLevels?: number[];
  mealTimes?: string[];
  [key: string]: any;
}

// Food Logging

export interface FoodLog {
  id: string;
  userId: string;
  foodName: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodLogRequest {
  foodName: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  imageUrl?: string;
}

export interface UpdateFoodLogRequest {
  foodName?: string;
  amount?: number;
  unit?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time?: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  imageUrl?: string;
}

export interface FoodLogsResponse {
  total: number;
  data: FoodLog[];
}

export interface FoodDailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

export interface FoodWeeklySummary {
  startDate: string;
  endDate: string;
  dailySummaries: FoodDailySummary[];
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
}

// Exercise Logging

export interface ExerciseLog {
  id: string;
  userId: string;
  name: string;
  type: string;
  duration: number;
  intensity: string;
  calories: number;
  time: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciseLogRequest {
  name: string;
  type: string;
  duration: number;
  intensity: string;
  calories: number;
  time: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface UpdateExerciseLogRequest {
  name?: string;
  type?: string;
  duration?: number;
  intensity?: string;
  calories?: number;
  time?: string;
  geolocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface ExerciseLogsResponse {
  total: number;
  data: ExerciseLog[];
}

export interface ExerciseDailySummary {
  date: string;
  totalCalories: number;
  totalDuration: number;
  exerciseCount: number;
}

export interface ExerciseWeeklySummary {
  startDate: string;
  endDate: string;
  dailySummaries: ExerciseDailySummary[];
  averageCalories: number;
  averageDuration: number;
}

// Sleep Logging

export interface SleepLog {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  quality: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSleepLogRequest {
  startTime: string;
  endTime: string;
  quality: number;
}

export interface UpdateSleepLogRequest {
  startTime?: string;
  endTime?: string;
  quality?: number;
}

export interface SleepLogsResponse {
  total: number;
  data: SleepLog[];
}

// AI Assistant

export interface ChatRequest {
  message: string;
  userId: string;
}

export interface ChatResponse {
  message: string;
  response: string;
}

// Pagination and Filtering

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

// Success response
export interface SuccessResponse {
  success: boolean;
}
