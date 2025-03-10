/**
 * User Service
 * 
 * This file contains functions for interacting with the User Service API.
 */

import apiClient from './api/client';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserPreferences,
  CircadianQuestionnaire,
  SuccessResponse
} from './api/types';

/**
 * Register a new user
 * @param userData User registration data
 * @returns The created user
 */
export async function registerUser(userData: RegisterRequest): Promise<User> {
  try {
    const response = await apiClient.userServicePost<User>('/user', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * Login a user
 * @param credentials User login credentials
 * @returns Login response with access token and refresh token
 */
export async function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await apiClient.userServicePost<LoginResponse>('/auth/login', credentials);
    
    // Store both tokens
    await apiClient.setAuthToken(response.data.accessToken);
    await apiClient.setRefreshToken(response.data.refreshToken);
    
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

/**
 * Logout the current user
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiClient.clearAuthToken();
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

/**
 * Get the current user's profile
 * @returns The user profile
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiClient.userServiceGet<User>('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Error getting current user:', error);
    throw error;
  }
}

/**
 * Update the current user's profile
 * @param userData User data to update
 * @returns The updated user
 */
export async function updateCurrentUser(userData: Partial<User>): Promise<User> {
  try {
    // First get the current user to get the ID
    const currentUser = await getCurrentUser();
    
    // Then update the user with the ID
    const response = await apiClient.userServicePut<User>(`/user/${currentUser.id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Update the current user's preferences
 * @param preferences User preferences to update
 * @returns The updated user
 */
export async function updateUserPreferences(preferences: UserPreferences): Promise<User> {
  try {
    const response = await apiClient.userServicePatch<User>('/api/users/me/preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

/**
 * Submit the circadian questionnaire
 * @param questionnaireData Questionnaire data
 * @returns The updated user
 */
export async function submitCircadianQuestionnaire(questionnaireData: CircadianQuestionnaire): Promise<User> {
  try {
    const response = await apiClient.userServicePost<User>('/api/users/me/circadian-questionnaire', questionnaireData);
    return response.data;
  } catch (error) {
    console.error('Error submitting circadian questionnaire:', error);
    throw error;
  }
}

/**
 * Initiate Google OAuth login
 * This would typically redirect to Google's OAuth consent screen
 * In a React Native app, this would use a WebView or external browser
 */
export function initiateGoogleLogin(): void {
  // This would be implemented using a library like expo-auth-session
  // For now, we'll just log a message
  console.log('Google login not implemented yet');
}

/**
 * Check if the user is authenticated
 * @returns True if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  return apiClient.isAuthenticated();
}
