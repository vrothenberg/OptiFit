/**
 * AI Service
 * 
 * This file contains functions for interacting with the AI Service API.
 */

import apiClient from './api/client';
import { ChatRequest, ChatResponse } from './api/types';

/**
 * Send a message to the AI assistant
 * @param chatRequest Chat request with message and user ID
 * @returns Chat response with the AI's reply
 */
export async function sendChatMessage(chatRequest: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await apiClient.aiServicePost<ChatResponse>('/api/ai/chat', chatRequest);
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Analyze user data for insights
 * This is a placeholder for a more complex analysis endpoint
 * @param userId User ID
 * @returns Analysis response
 */
export async function analyzeUserData(userId: string): Promise<any> {
  try {
    const response = await apiClient.aiServicePost<any>('/api/ai/analyze', { userId });
    return response.data;
  } catch (error) {
    console.error('Error analyzing user data:', error);
    throw error;
  }
}

/**
 * Process voice input for logging
 * This would handle voice-to-text conversion and intent recognition
 * @param audioData Base64 encoded audio data
 * @param userId User ID
 * @returns Processed voice input
 */
export async function processVoiceInput(audioData: string, userId: string): Promise<any> {
  try {
    const response = await apiClient.aiServicePost<any>('/api/ai/voice-log', { audioData, userId });
    return response.data;
  } catch (error) {
    console.error('Error processing voice input:', error);
    throw error;
  }
}

/**
 * Get personalized recommendations
 * @param userId User ID
 * @param category Optional category for recommendations (e.g., 'food', 'exercise', 'sleep')
 * @returns Recommendations
 */
export async function getRecommendations(userId: string, category?: string): Promise<any> {
  try {
    const response = await apiClient.aiServiceGet<any>('/api/ai/recommendations', { 
      params: { userId, category } 
    });
    return response.data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}

/**
 * Get circadian score and insights
 * @param userId User ID
 * @returns Circadian score and insights
 */
export async function getCircadianScore(userId: string): Promise<any> {
  try {
    const response = await apiClient.aiServiceGet<any>('/api/ai/circadian-score', { 
      params: { userId } 
    });
    return response.data;
  } catch (error) {
    console.error('Error getting circadian score:', error);
    throw error;
  }
}
