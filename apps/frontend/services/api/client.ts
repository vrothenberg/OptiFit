/**
 * API Client
 * 
 * This file contains the base API client with authentication handling.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
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
        // Skip authentication for login and register endpoints
        const isAuthEndpoint = 
          config.url?.includes('/auth/login') || 
          config.url?.includes('/user') && config.method === 'post';

        if (!isAuthEndpoint) {
          const token = await this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for handling errors
    client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
          // Try to refresh the token
          const refreshToken = await this.getRefreshToken();
          
          if (refreshToken) {
            try {
              // Try to get a new access token
              const response = await this.refreshAccessToken(refreshToken);
              
              if (response) {
                // Retry the original request with the new token
                const originalRequest = error.config;
                if (originalRequest && originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                  return this.userServiceClient(originalRequest);
                }
              }
            } catch (refreshError) {
              console.error('Error refreshing token:', refreshError);
              // If refresh fails, clear tokens and reject
              await this.clearAuthToken();
              return Promise.reject(error);
            }
          } else {
            // No refresh token, clear tokens
            await this.clearAuthToken();
          }
          
          // Redirect to login (this would be handled by the app's navigation)
          // For now, we'll just reject the promise
          return Promise.reject(error);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Get the access token from secure storage
  public async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Set the access token in secure storage
  public async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  }

  // Set the refresh token in secure storage
  public async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  // Get the refresh token from secure storage
  public async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // Clear all tokens from secure storage
  public async clearAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
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
    const token = await this.getAuthToken();
    return !!token;
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
