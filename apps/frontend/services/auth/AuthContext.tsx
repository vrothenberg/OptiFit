import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { Platform, Alert } from 'react-native';
import apiClient from '../api/client';
import { logoutUser } from '../userService';
import AppLoadingScreen from '@/components/AppLoadingScreen';

// Define the shape of our authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  checkAuth: async () => false,
  logout: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const router = useRouter();
  const segments = useSegments();

  // Function to check if the user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    try {
      const isAuth = await apiClient.isAuthenticated();
      console.log('Authentication check result:', isAuth);
      setIsAuthenticated(isAuth);
      return isAuth;
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Simple navigation helper
  const safeNavigate = (route: string) => {
    console.log(`Navigating to: ${route}`);
    
    try {
      router.replace(route as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // If navigation fails, try again with window.location for web
      if (Platform.OS === 'web') {
        window.location.href = route;
      }
    }
  };

  // Function to handle logout with proper state management
  const logout = async (): Promise<void> => {
    try {
      console.log('Logout initiated in AuthContext');
      setIsLoggingOut(true);
      
      // First update the state to trigger UI updates
      setIsAuthenticated(false);
      
      // Then clear the tokens
      await logoutUser();
      
      console.log('Tokens cleared, navigating to landing page');
      
      // Force a hard navigation for web
      if (Platform.OS === 'web') {
        console.log('Using window.location for web navigation');
        
        // Clear any cached auth data
        try {
          // Clear session storage as well
          sessionStorage.clear();
          
          // Clear any auth-related cookies
          document.cookie.split(';').forEach(cookie => {
            const [name] = cookie.trim().split('=');
            if (name.includes('token') || name.includes('auth') || name.includes('session')) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
          });
        } catch (e) {
          console.warn('Error clearing browser storage:', e);
        }
        
        // Use replace instead of href to avoid adding to browser history
        window.location.replace('/');
        return;
      }
      
      // For native, use router
      safeNavigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Restore auth state if logout fails
      await checkAuth();
    } finally {
      // Ensure we reset the logging out state even if there was an error
      setTimeout(() => {
        setIsLoggingOut(false);
      }, 300);
    }
  };

  // Effect to check authentication status on mount and periodically
  useEffect(() => {
    // Initial auth check
    checkAuth();
    
    // Set up periodic auth check (every 5 minutes)
    const intervalId = setInterval(() => {
      console.log('Performing periodic auth check');
      checkAuth();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);

  // Register a listener for auth failures from the API client
  useEffect(() => {
    console.log('Setting up auth failure listener');
    const unsubscribe = apiClient.onAuthFailure(() => {
      console.log('Auth failure detected in AuthContext');
      setIsAuthenticated(false);
      
      // For web, force a hard navigation to ensure a full page reload
      if (Platform.OS === 'web') {
        console.log('Using window.location for web navigation on auth failure');
        // Force a full page reload by using window.location
        window.location.href = '/';
        return;
      } else {
        // For native, show a notification and use router
        Alert.alert('Session Expired', 'Your session has expired. You will be redirected to the login page.');
        router.replace('/');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // Effect to handle navigation based on auth state
  // This effect only runs after authentication state is fully determined (isLoading is false)
  useEffect(() => {
    // Skip if still loading auth state
    if (isLoading) return;
    
    const inAuthGroup = segments[0] === 'auth';
    const inProtectedGroup = segments[0] === '(tabs)';
    const inDevTools = segments[0] === 'dev-tools';
    const segmentsLength = segments.length as number;
    const inRootRoute = segmentsLength === 0 || (
      segmentsLength === 1 && 
      segments[0] !== 'auth' && 
      segments[0] !== '(tabs)' &&
      segments[0] !== 'dev-tools'
    );

    console.log('Auth navigation effect triggered:', { 
      isAuthenticated, 
      segments, 
      inAuthGroup, 
      inProtectedGroup,
      inRootRoute
    });

    // Simple navigation rules
    if (!isAuthenticated && inProtectedGroup) {
      // Redirect to landing page if user is not authenticated and tries to access protected routes
      console.log('Not authenticated, redirecting from protected route to landing page');
      safeNavigate('/');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if user is authenticated and tries to access auth routes
      console.log('Authenticated, redirecting from auth route to tabs');
      safeNavigate('/(tabs)');
    } else if (isAuthenticated && inRootRoute) {
      // Redirect to tabs if user is authenticated and at the root route
      console.log('Authenticated at root route, redirecting to tabs');
      safeNavigate('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading, router]);

  // Provide a loading screen during authentication checks or logout
  if (isLoading || isLoggingOut) {
    return <AppLoadingScreen />;
  }

  const value = {
    isAuthenticated,
    isLoading,
    checkAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
