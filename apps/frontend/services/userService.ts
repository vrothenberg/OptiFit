/**
 * User Service
 * 
 * This file contains functions for interacting with the User Service API.
 */

import apiClient from './api/client';
import { Platform } from 'react-native';
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
 * Initial registration with email and password
 * @param userData User email and password
 * @returns Login response with access token and refresh token
 * @throws Error with specific message from the backend or a generic message
 */
export async function initialRegister(userData: { email: string, password: string }): Promise<LoginResponse> {
  try {
    console.log('Registering user with email:', userData.email);
    console.log('Current platform:', Platform.OS);
    const response = await apiClient.userServicePost<LoginResponse>('/auth/register', userData);
    console.log('Registration successful, received tokens:', 
      response.data.accessToken ? 'Access token received' : 'No access token', 
      response.data.refreshToken ? 'Refresh token received' : 'No refresh token'
    );
    
    // Store both tokens
    await apiClient.setAuthToken(response.data.accessToken);
    console.log('Access token stored');
    await apiClient.setRefreshToken(response.data.refreshToken);
    console.log('Refresh token stored');
    
    // Verify token was stored
    const isAuth = await apiClient.isAuthenticated();
    console.log('Authentication status after registration:', isAuth);
    
    return response.data;
  } catch (error: any) {
    console.error('Error during initial registration:', error);
    
    // Extract specific error message from the response if available
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Get the error message, ensuring it's a string
      let errorMessage: string;
      
      // Handle the case where the entire errorData is the error object with a message property
      if (typeof errorData === 'object' && errorData.message) {
        if (typeof errorData.message === 'string') {
          // If message is already a string, use it directly
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          // If message is an array (NestJS validation errors), join them
          errorMessage = errorData.message.join(', ');
        } else if (typeof errorData.message === 'object') {
          // If message is an object, try to extract the actual error message
          if (error.response.status === 409) {
            errorMessage = 'User with this email already exists';
          } else {
            errorMessage = 'Invalid email or password';
          }
        } else {
          // Fallback for other cases
          errorMessage = 'Registration failed. Please try again.';
        }
      } else {
        // Fallback if errorData doesn't have a message property
        errorMessage = 'Registration failed. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
    
    // If we couldn't extract a specific message, throw a generic one
    throw new Error('Registration failed. Please try again.');
  }
}

/**
 * Complete registration with profile data
 * @param profileData User profile data
 * @returns The updated user
 * @throws Error with specific message from the backend or a generic message
 */
export async function completeRegistration(profileData: any): Promise<User> {
  try {
    console.log('Completing registration with profile data:', JSON.stringify(profileData));
    
    // Verify token is available before making the request
    const isAuth = await apiClient.isAuthenticated();
    console.log('Authentication status before completing registration:', isAuth);
    
    // Get the token to check it
    const token = await apiClient.getAuthToken();
    console.log('Token available for request:', token ? 'Yes' : 'No');
    
    // Log the platform to help with debugging
    console.log('Current platform:', Platform.OS);
    
    const response = await apiClient.userServicePost<User>('/auth/complete-registration', profileData);
    console.log('Profile completion successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error completing registration:', error);
    
    // Extract specific error message from the response if available
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Handle unauthorized errors (usually 401 Unauthorized)
      if (error.response.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Get the error message, ensuring it's a string
      let errorMessage: string;
      
      // Handle the case where the entire errorData is the error object with a message property
      if (typeof errorData === 'object' && errorData.message) {
        if (typeof errorData.message === 'string') {
          // If message is already a string, use it directly
          errorMessage = errorData.message;
        } else if (Array.isArray(errorData.message)) {
          // If message is an array (NestJS validation errors), join them
          errorMessage = errorData.message.join(', ');
        } else if (typeof errorData.message === 'object') {
          // If message is an object, try to extract a meaningful message
          errorMessage = 'Profile update failed. Please try again.';
        } else {
          // Fallback for other cases
          errorMessage = 'Profile update failed. Please try again.';
        }
      } else {
        // Fallback if errorData doesn't have a message property
        errorMessage = 'Profile update failed. Please try again.';
      }
      
      throw new Error(errorMessage);
    }
    
    // If we couldn't extract a specific message, throw a generic one
    throw new Error('Profile update failed. Please try again.');
  }
}

/**
 * Register a new user (DEPRECATED - use initialRegister and completeRegistration instead)
 * @deprecated This method uses a legacy endpoint. Please use the two-step registration process with
 * initialRegister() and completeRegistration() instead.
 * @param userData User registration data
 * @returns The created user
 */
export async function registerUser(userData: RegisterRequest): Promise<User> {
  console.warn(
    'DEPRECATED: registerUser() is deprecated and will be removed in a future version. ' +
    'Please use initialRegister() and completeRegistration() instead.'
  );
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
    console.log(`[userService] Attempting to login user with email: ${credentials.email}`);
    console.log(`[userService] Password provided: ${credentials.password ? 'Yes' : 'No'}, Length: ${credentials.password?.length || 0}`);
    
    const response = await apiClient.userServicePost<LoginResponse>('/auth/login', credentials);
    console.log(`[userService] Login API call successful, status: ${response.status}`);
    console.log(`[userService] Tokens received:`, {
      accessToken: response.data.accessToken ? `${response.data.accessToken.substring(0, 10)}...` : 'None',
      refreshToken: response.data.refreshToken ? `${response.data.refreshToken.substring(0, 10)}...` : 'None'
    });
    
    // Store both tokens
    await apiClient.setAuthToken(response.data.accessToken);
    console.log(`[userService] Access token stored`);
    
    await apiClient.setRefreshToken(response.data.refreshToken);
    console.log(`[userService] Refresh token stored`);
    
    // Verify token was stored
    const isAuth = await apiClient.isAuthenticated();
    console.log(`[userService] Authentication status after login: ${isAuth}`);
    
    return response.data;
  } catch (error: any) {
    console.error('Error logging in:', error);
    console.log(`[userService] Login error status: ${error.response?.status}`);
    console.log(`[userService] Login error data:`, error.response?.data);
    
    // Extract specific error message from the response if available
    if (error.response?.data) {
      const errorData = error.response.data;
      console.log(`[userService] Error data type: ${typeof errorData}`);
      
      // Get the error message, ensuring it's a string
      let errorMessage: string;
      
      // Handle the case where the entire errorData is the error object with a message property
      if (typeof errorData === 'object' && errorData.message) {
        console.log(`[userService] Error message type: ${typeof errorData.message}`);
        
        if (typeof errorData.message === 'string') {
          // If message is already a string, use it directly
          errorMessage = errorData.message;
          console.log(`[userService] Error message (string): ${errorMessage}`);
        } else if (Array.isArray(errorData.message)) {
          // If message is an array (NestJS validation errors), join them
          errorMessage = errorData.message.join(', ');
          console.log(`[userService] Error message (array): ${errorMessage}`);
        } else if (typeof errorData.message === 'object') {
          // If message is an object, try to extract a meaningful message
          errorMessage = 'Login failed. Please check your credentials and try again.';
          console.log(`[userService] Error message (object): Using default message`);
        } else {
          // Fallback for other cases
          errorMessage = 'Login failed. Please check your credentials and try again.';
          console.log(`[userService] Error message (unknown): Using default message`);
        }
      } else {
        // Fallback if errorData doesn't have a message property
        errorMessage = 'Login failed. Please check your credentials and try again.';
        console.log(`[userService] No error message property: Using default message`);
      }
      
      throw new Error(errorMessage);
    }
    
    // If we couldn't extract a specific message, throw a generic one
    console.log(`[userService] No response data: Using generic error message`);
    throw new Error('Login failed. Please check your credentials and try again.');
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
    console.log('Submitting circadian questionnaire:', JSON.stringify(questionnaireData));
    const response = await apiClient.userServicePost<User>('/user/circadian-questionnaire', questionnaireData);
    console.log('Questionnaire submission successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting circadian questionnaire:', error);
    throw error;
  }
}

/**
 * Get all circadian questionnaires for the current user
 * @returns Array of questionnaires
 */
export async function getCircadianQuestionnaires(): Promise<CircadianQuestionnaire[]> {
  try {
    const response = await apiClient.userServiceGet<CircadianQuestionnaire[]>('/user/circadian-questionnaire');
    return response.data;
  } catch (error) {
    console.error('Error getting circadian questionnaires:', error);
    throw error;
  }
}

/**
 * Get the latest circadian questionnaire for the current user
 * @returns The latest questionnaire or null if none exists
 */
export async function getLatestCircadianQuestionnaire(): Promise<CircadianQuestionnaire | null> {
  try {
    const response = await apiClient.userServiceGet<CircadianQuestionnaire>('/user/circadian-questionnaire/latest');
    return response.data;
  } catch (error) {
    console.error('Error getting latest circadian questionnaire:', error);
    throw error;
  }
}

/**
 * Initiate Google login (placeholder function)
 * 
 * This is a placeholder function for Google OAuth login.
 * In a real implementation, this would use expo-auth-session or similar.
 */
export function initiateGoogleLogin(): void {
  console.log('Google login initiated (placeholder)');
  // This is just a placeholder - in a real app, this would initiate the OAuth flow
}

/**
 * Invalidate the current token for testing purposes
 * 
 * This function deliberately corrupts the stored access token to simulate
 * an expired or invalid token scenario. This is useful for testing the
 * application's behavior when tokens are invalid.
 * 
 * @param invalidationType The type of invalidation to perform:
 *   - 'corrupt': Modifies the token to make it malformed (default)
 *   - 'empty': Sets the token to an empty string
 *   - 'expired': Attempts to modify the token to appear expired
 * 
 * @returns A promise that resolves when the token has been invalidated
 */
export async function invalidateToken(invalidationType: 'corrupt' | 'empty' | 'expired' = 'corrupt'): Promise<void> {
  try {
    console.log(`[userService] Invalidating token (type: ${invalidationType})`);
    
    // Get the current token
    const currentToken = await apiClient.getAuthToken();
    
    if (!currentToken) {
      console.warn('[userService] No token found to invalidate');
      return;
    }
    
    let invalidToken: string;
    
    switch (invalidationType) {
      case 'empty':
        // Set to empty string
        invalidToken = '';
        break;
        
      case 'expired':
        try {
          // JWT tokens have three parts separated by dots
          const parts = currentToken.split('.');
          
          if (parts.length !== 3) {
            // Not a valid JWT token, fall back to corruption
            invalidToken = currentToken + '_invalid';
            break;
          }
          
          // The second part is the payload, which we'll modify
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          
          // Set expiration to a past time
          payload.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
          
          // Encode the modified payload
          const modifiedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
            .replace(/=/g, '') // Remove padding
            .replace(/\+/g, '-') // Replace + with -
            .replace(/\//g, '_'); // Replace / with _
          
          // Reconstruct the token with the modified payload
          invalidToken = `${parts[0]}.${modifiedPayload}.${parts[2]}`;
        } catch (error) {
          console.error('[userService] Error creating expired token:', error);
          // Fall back to corruption
          invalidToken = currentToken + '_invalid';
        }
        break;
        
      case 'corrupt':
      default:
        // Append an invalid string to corrupt the token
        invalidToken = currentToken + '_invalid';
        break;
    }
    
    // Store the invalid token
    await apiClient.setAuthToken(invalidToken);
    console.log('[userService] Token invalidated successfully');
    
    // Verify the token was changed
    const newToken = await apiClient.getAuthToken();
    console.log(`[userService] New token: ${newToken ? (newToken === invalidToken ? 'Successfully invalidated' : 'Unexpected token value') : 'No token found'}`);
    
  } catch (error) {
    console.error('[userService] Error invalidating token:', error);
    throw new Error('Failed to invalidate token');
  }
}

/**
 * Force logout the user regardless of token state
 * 
 * This function provides a way to log out even when the normal logout
 * flow might be broken due to token issues. It clears tokens and
 * forces a navigation to the login screen.
 * 
 * @returns A promise that resolves when the force logout is complete
 */
export async function forceLogout(): Promise<void> {
  try {
    console.log('[userService] Force logout initiated');
    
    // Clear tokens first to ensure we're logged out
    await apiClient.clearAuthToken();
    
    // For web, force a hard navigation
    if (Platform.OS === 'web') {
      console.log('[userService] Using window.location for web navigation');
      // Set a flag in localStorage to indicate we're force logging out
      localStorage.setItem('optifit_force_logout', 'true');
      
      // Force a full page reload by using window.location
      // This ensures we get a fresh page load and not just a client-side navigation
      window.location.href = '/';
      
      // Return early since the page will reload
      return;
    }
    
    // For native, we would need to use a global event system
    // This is a placeholder - in a real app, you might use a global event emitter
    console.log('[userService] Force logout completed for native platform');
  } catch (error) {
    console.error('[userService] Error during force logout:', error);
    
    // Even if there's an error, try the most direct approach for web
    if (Platform.OS === 'web') {
      // Last resort - force navigation even if the rest failed
      window.location.href = '/';
    }
    
    // For native, we need to propagate the error
    throw new Error('Force logout failed');
  }
}
