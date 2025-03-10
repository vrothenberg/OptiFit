/**
 * Cross-Platform Storage Adapter
 * 
 * This file provides a unified storage interface that works across all platforms:
 * - Uses expo-secure-store for native platforms (iOS/Android)
 * - Falls back to localStorage for web platforms
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Determines if the current platform is web
 */
const isWeb = Platform.OS === 'web';

/**
 * Get a value from storage
 * @param key The key to retrieve
 * @returns The stored value, or null if not found
 */
export async function getItemAsync(key: string): Promise<string | null> {
  try {
    if (isWeb) {
      // Use localStorage for web
      const value = localStorage.getItem(key);
      return value;
    } else {
      // Use SecureStore for native platforms
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`Error getting item with key ${key}:`, error);
    return null;
  }
}

/**
 * Store a value in storage
 * @param key The key to store under
 * @param value The value to store
 */
export async function setItemAsync(key: string, value: string): Promise<void> {
  try {
    if (isWeb) {
      // Use localStorage for web
      localStorage.setItem(key, value);
    } else {
      // Use SecureStore for native platforms
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`Error setting item with key ${key}:`, error);
  }
}

/**
 * Delete a value from storage
 * @param key The key to delete
 */
export async function deleteItemAsync(key: string): Promise<void> {
  try {
    if (isWeb) {
      // Use localStorage for web
      localStorage.removeItem(key);
    } else {
      // Use SecureStore for native platforms
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error deleting item with key ${key}:`, error);
  }
}

/**
 * Check if a key exists in storage
 * @param key The key to check
 * @returns True if the key exists, false otherwise
 */
export async function containsKeyAsync(key: string): Promise<boolean> {
  try {
    if (isWeb) {
      // Use localStorage for web
      return localStorage.getItem(key) !== null;
    } else {
      // Use SecureStore for native platforms
      return await SecureStore.isAvailableAsync() && (await SecureStore.getItemAsync(key)) !== null;
    }
  } catch (error) {
    console.error(`Error checking if key ${key} exists:`, error);
    return false;
  }
}
