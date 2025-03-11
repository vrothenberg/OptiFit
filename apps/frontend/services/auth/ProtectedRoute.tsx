import React, { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import AppLoadingScreen from '@/components/AppLoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component
 * 
 * Wraps routes that require authentication.
 * If the user is not authenticated, they will be redirected to the landing page.
 * While checking authentication status, a loading spinner is displayed.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  // The actual redirection happens in the AuthContext's useEffect
  // This component just renders the children if authenticated
  return <>{children}</>;
}
