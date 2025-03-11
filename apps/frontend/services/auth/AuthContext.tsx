import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { Platform } from 'react-native';
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
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
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

  // Smooth navigation with transition state
  const navigateWithTransition = async (route: string) => {
    setIsTransitioning(true);
    
    // Wrap navigation in try/catch to handle potential errors
    try {
      // Add a slightly longer delay for navigation
      await new Promise(resolve => setTimeout(resolve, 300));
      router.replace(route as any);
    } catch (error) {
      console.error('Navigation error:', error);
      // If navigation fails, try again with window.location for web
      if (Platform.OS === 'web') {
        window.location.href = route;
      }
    }
    
    // Allow time for navigation to complete
    setTimeout(() => setIsTransitioning(false), 500);
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
        // Set a flag in localStorage to indicate we're logging out
        localStorage.setItem('optifit_logging_out', 'true');
        
        // Add a small delay to ensure state updates are processed
        setTimeout(() => {
          window.location.href = '/';
        }, 200);
        return;
      }
      
      // For native, use router with transition
      await navigateWithTransition('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Restore auth state if logout fails
      await checkAuth();
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Effect to check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Register a listener for auth failures from the API client
  useEffect(() => {
    console.log('Setting up auth failure listener');
    const unsubscribe = apiClient.onAuthFailure(() => {
      console.log('Auth failure detected in AuthContext');
      setIsAuthenticated(false);
      router.replace('/');
    });
    
    return () => unsubscribe();
  }, [router]);

  // Effect to handle navigation based on auth state
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inProtectedGroup = segments[0] === '(tabs)';
    // Fix TypeScript error with proper type assertion
    // Use type assertion to fix TypeScript errors
    const segmentsLength = segments.length as number;
    const inRootRoute = segmentsLength === 0 || (
      segmentsLength === 1 && 
      segments[0] !== 'auth' && 
      segments[0] !== '(tabs)'
    );

    console.log('Auth navigation effect triggered:', { 
      isAuthenticated, 
      segments, 
      inAuthGroup, 
      inProtectedGroup,
      inRootRoute
    });

    // Don't navigate if we're already transitioning
    if (isTransitioning) return;

    if (!isAuthenticated && inProtectedGroup) {
      // Redirect to landing page if user is not authenticated and tries to access protected routes
      console.log('Not authenticated, redirecting from protected route to landing page');
      navigateWithTransition('/');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if user is authenticated and tries to access auth routes
      console.log('Authenticated, redirecting from auth route to tabs');
      navigateWithTransition('/(tabs)');
    } else if (isAuthenticated && inRootRoute) {
      // Redirect to tabs if user is authenticated and at the root route
      console.log('Authenticated at root route, redirecting to tabs');
      navigateWithTransition('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);

  // Provide a loading screen during authentication checks, transitions, or logout
  if (isLoading || isTransitioning || isLoggingOut) {
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
