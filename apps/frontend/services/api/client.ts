/**
 * API Client
 * 
 * This file contains the base API client with authentication handling.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as Storage from './storage';
import config from './config';
import { ApiError } from './types';

// Token storage keys
const ACCESS_TOKEN_KEY = 'optifit_access_token';
const REFRESH_TOKEN_KEY = 'optifit_refresh_token';

// Create a class for the API client
class ApiClient {
  private userServiceClient: AxiosInstance;
  private loggingServiceClient: AxiosInstance;
  private aiServiceClient: AxiosInstance;
  private authFailureListeners: (() => void)[] = [];

  constructor() {
    // Create axios instances for each service
    this.userServiceClient = this.createClient(config.userServiceUrl);
    this.loggingServiceClient = this.createClient(config.loggingServiceUrl);
    this.aiServiceClient = this.createClient(config.aiServiceUrl);

    // Set up request interceptors for authentication
    this.setupAuthInterceptors(this.userServiceClient);
    this.setupAuthInterceptors(this.loggingServiceClient);
    this.setupAuthInterceptors(this.aiServiceClient);
  }

  // Create a new axios instance with default configuration
  private createClient(baseURL: string): AxiosInstance {
    return axios.create({
      baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  // Set up request interceptors for authentication
  private setupAuthInterceptors(client: AxiosInstance): void {
    client.interceptors.request.use(
      async (config) => {
        // Skip authentication for login, register, and legacy user creation endpoints
        const isAuthEndpoint = 
          config.url?.includes('/auth/login') || 
          config.url?.includes('/auth/register') ||
          (config.url === '/user' && config.method === 'post'); // Exact match for legacy user creation

        console.log(`Request to ${config.url}, auth required: ${!isAuthEndpoint}`);

        if (!isAuthEndpoint) {
          const token = await this.getAuthToken();
          console.log(`Token for request to ${config.url}: ${token ? 'Available' : 'Not available'}`);
          
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log(`Added Authorization header for ${config.url}`);
          } else {
            console.log(`No token available for ${config.url}`);
          }
        } else {
          console.log(`Skipping authentication for ${config.url}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        // If config is missing, we can't do much with this error
        if (!error.config) {
          return Promise.reject(error);
        }
        
        // Skip token refresh for auth endpoints
        const isAuthEndpoint = 
          error.config.url?.includes('/auth/login') || 
          error.config.url?.includes('/auth/register') ||
          error.config.url?.includes('/auth/refresh') ||
          (error.config.url === '/user' && error.config.method === 'post');
        
        // Add retry count property if it doesn't exist
        // @ts-ignore - Adding custom property to config
        const retryCount = error.config._retryCount || 0;
        
        // Handle 401 Unauthorized errors (but not for auth endpoints)
        if (error.response?.status === 401 && !isAuthEndpoint) {
          console.log(`401 error for ${error.config.url}, retry count: ${retryCount}`);
          
          // Check if we've already tried to refresh too many times
          if (retryCount >= 2) {
            console.error('Maximum token refresh attempts reached. Logging out.');
            
            // Clear tokens first to ensure we're logged out
            await this.clearAuthToken();
            
            // Trigger auth failure event for listeners
            this.triggerAuthFailure();
            
            return Promise.reject(new Error('Your session has expired. Please log in again.'));
          }
          
          try {
            // Try to refresh the token
            const refreshToken = await this.getRefreshToken();
            
            if (!refreshToken) {
              console.log('No refresh token available, triggering auth failure');
              await this.clearAuthToken();
              this.triggerAuthFailure();
              return Promise.reject(new Error('Your session has expired. Please log in again.'));
            }
            
            console.log('Attempting to refresh access token...');
            
            // Create a new instance for the refresh request to avoid interceptors
            const axiosInstance = axios.create({
              baseURL: this.userServiceClient.defaults.baseURL,
              timeout: config.timeout,
            });
            
            // Try to get a new access token
            const response = await axiosInstance.post('/auth/refresh', { refreshToken });
            
            if (response.data && response.data.accessToken) {
              console.log('Token refresh successful, retrying original request');
              
              // Store the new tokens
              await this.setAuthToken(response.data.accessToken);
              if (response.data.refreshToken) {
                await this.setRefreshToken(response.data.refreshToken);
              }
              
              // Retry the original request with the new token
              const originalRequest = error.config;
              if (originalRequest && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                // Increment retry count
                // @ts-ignore - Accessing custom property
                originalRequest._retryCount = retryCount + 1;
                
                // Use the appropriate client based on the original URL
                if (originalRequest.baseURL?.includes(config.loggingServiceUrl)) {
                  return this.loggingServiceClient(originalRequest);
                } else if (originalRequest.baseURL?.includes(config.aiServiceUrl)) {
                  return this.aiServiceClient(originalRequest);
                } else {
                  return this.userServiceClient(originalRequest);
                }
              }
            } else {
              throw new Error('Invalid response from refresh token endpoint');
            }
          } catch (refreshError: any) {
            const errorMessage = refreshError?.response?.data?.message || 'Unknown error refreshing token';
            console.error(`Error refreshing token: ${errorMessage}`, refreshError);
            
            // If refresh fails, clear tokens and reject
            await this.clearAuthToken();
            
            // Trigger auth failure event for listeners
            this.triggerAuthFailure();
            
            return Promise.reject(new Error('Your session has expired. Please log in again.'));
          }
        }
        
        // For other errors, pass through with better error messages
        const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
        console.error(`API Error: ${errorMessage}`);
        return Promise.reject(error);
      }
    );
  }

  // Get the access token from storage
  public async getAuthToken(): Promise<string | null> {
    try {
      return await Storage.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Set the access token in storage
  public async setAuthToken(token: string): Promise<void> {
    try {
      await Storage.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  }

  // Set the refresh token in storage
  public async setRefreshToken(token: string): Promise<void> {
    try {
      await Storage.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  // Get the refresh token from storage
  public async getRefreshToken(): Promise<string | null> {
    try {
      return await Storage.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Clear all tokens from storage
  public async clearAuthToken(): Promise<void> {
    try {
      await Storage.deleteItemAsync(ACCESS_TOKEN_KEY);
      await Storage.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  // Refresh the access token using the refresh token
  public async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await this.userServiceClient.post('/auth/refresh', { refreshToken });
      
      // Store the new tokens
      await this.setAuthToken(response.data.accessToken);
      await this.setRefreshToken(response.data.refreshToken);
      
      return response.data;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  // Check if the user is authenticated
  public async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      
      // If no token exists, user is not authenticated
      if (!token) {
        console.log('No access token found');
        return false;
      }
      
      // Check if token is expired by trying to decode it
      // JWT tokens have three parts separated by dots
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        console.log('Token is not a valid JWT format');
        // Invalid token format, clear tokens and trigger auth failure
        await this.clearAuthToken();
        this.triggerAuthFailure();
        return false;
      }
      
      try {
        // Try to decode the payload
        const payload = JSON.parse(atob(parts[1]));
        
        // Check if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.log('Token is expired, attempting to refresh');
          
          // Try to refresh the token
          const refreshToken = await this.getRefreshToken();
          
          if (!refreshToken) {
            console.log('No refresh token available, clearing auth state');
            await this.clearAuthToken();
            this.triggerAuthFailure();
            return false;
          }
          
          try {
            // Try to refresh the token
            await this.refreshAccessToken(refreshToken);
            console.log('Token refreshed successfully');
            return true;
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);
            await this.clearAuthToken();
            this.triggerAuthFailure();
            return false;
          }
        }
        
        // Token exists and is not expired
        return true;
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        // Error decoding token, clear tokens and trigger auth failure
        await this.clearAuthToken();
        this.triggerAuthFailure();
        return false;
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // On any error, clear tokens to be safe
      await this.clearAuthToken();
      return false;
    }
  }

  // Register a listener for auth failures
  public onAuthFailure(listener: () => void): () => void {
    this.authFailureListeners.push(listener);
    
    // Return a function to unregister the listener
    return () => {
      this.authFailureListeners = this.authFailureListeners.filter(l => l !== listener);
    };
  }

  // Trigger auth failure event
  private triggerAuthFailure(): void {
    console.log('Triggering auth failure event');
    
    // Use setTimeout to ensure this runs after the current execution context
    // This helps prevent race conditions in the UI
    setTimeout(() => {
      this.authFailureListeners.forEach(listener => {
        try {
          listener();
        } catch (error) {
          console.error('Error in auth failure listener:', error);
        }
      });
    }, 0);
  }

  // User Service API methods

  public async userServiceGet<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.userServiceClient.get<T>(url, config);
  }

  public async userServicePost<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.userServiceClient.post<T>(url, data, config);
  }

  public async userServicePut<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.userServiceClient.put<T>(url, data, config);
  }

  public async userServicePatch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.userServiceClient.patch<T>(url, data, config);
  }

  public async userServiceDelete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.userServiceClient.delete<T>(url, config);
  }

  // Logging Service API methods

  public async loggingServiceGet<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.loggingServiceClient.get<T>(url, config);
  }

  public async loggingServicePost<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.loggingServiceClient.post<T>(url, data, config);
  }

  public async loggingServicePut<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.loggingServiceClient.put<T>(url, data, config);
  }

  public async loggingServicePatch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.loggingServiceClient.patch<T>(url, data, config);
  }

  public async loggingServiceDelete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.loggingServiceClient.delete<T>(url, config);
  }

  // AI Service API methods

  public async aiServiceGet<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.aiServiceClient.get<T>(url, config);
  }

  public async aiServicePost<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.aiServiceClient.post<T>(url, data, config);
  }

  public async aiServicePut<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.aiServiceClient.put<T>(url, data, config);
  }

  public async aiServicePatch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.aiServiceClient.patch<T>(url, data, config);
  }

  public async aiServiceDelete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.aiServiceClient.delete<T>(url, config);
  }
}

// Create a singleton instance of the API client
const apiClient = new ApiClient();

export default apiClient;
