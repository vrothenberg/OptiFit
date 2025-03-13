import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import Theme from '@/constants/Theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  ignoreTransientErrors?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isTransientError: boolean;
}

/**
 * A custom error boundary component that can handle and suppress transient errors
 * during navigation transitions.
 */
class ErrorBoundary extends Component<Props, State> {
  // Track when the error occurred to identify transient errors
  private errorTimestamp: number = 0;
  // Timer to reset transient errors
  private transientErrorTimer: NodeJS.Timeout | null = null;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isTransientError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Capture error details for logging
    this.errorTimestamp = Date.now();
    
    // Check if this might be a transient navigation error
    const isLikelyTransientError = this.isLikelyTransientNavigationError(error);
    
    this.setState({
      errorInfo,
      isTransientError: isLikelyTransientError
    });
    
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // For transient errors, automatically recover after a short delay
    if (isLikelyTransientError && this.props.ignoreTransientErrors !== false) {
      this.transientErrorTimer = setTimeout(() => {
        console.log('Recovering from transient error');
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isTransientError: false
        });
      }, 1000); // 1 second recovery time
    }
  }
  
  componentWillUnmount(): void {
    // Clear any pending timers
    if (this.transientErrorTimer) {
      clearTimeout(this.transientErrorTimer);
    }
  }
  
  /**
   * Attempt to identify if an error is likely a transient navigation error
   * based on error message patterns and timing
   */
  private isLikelyTransientNavigationError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    
    // Common patterns in navigation/routing errors
    const navigationErrorPatterns = [
      'cannot read property',
      'undefined is not an object',
      'null is not an object',
      'cannot read properties of undefined',
      'cannot read properties of null',
      'navigation',
      'router',
      'route',
      'screen',
      'component',
      'render',
      'layout',
      'not found',
      'missing',
      'failed to load'
    ];
    
    // Check if the error message matches any of our patterns
    const matchesPattern = navigationErrorPatterns.some(pattern => 
      errorMessage.includes(pattern)
    );
    
    return matchesPattern;
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If we should ignore this transient error, show a minimal loading state
      if (this.state.isTransientError && this.props.ignoreTransientErrors !== false) {
        return (
          <View style={styles.container}>
            <LinearGradient
              colors={[Theme.COLORS.GRADIENT_START, Theme.COLORS.GRADIENT_END]}
              style={styles.background}
            >
              <View style={styles.content}>
                <FontAwesome name="clock-o" size={70} color={Theme.COLORS.WHITE} />
                <Text style={styles.logoText}>OptiFit</Text>
              </View>
            </LinearGradient>
          </View>
        );
      }
      
      // Use the provided fallback or our default error UI
      return this.props.fallback || (
        <View style={styles.container}>
          <LinearGradient
            colors={[Theme.COLORS.GRADIENT_START, Theme.COLORS.GRADIENT_END]}
            style={styles.background}
          >
            <View style={styles.content}>
              <FontAwesome name="exclamation-triangle" size={70} color={Theme.COLORS.WHITE} />
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.errorMessage}>
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    marginTop: 10,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    marginTop: 20,
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: Theme.COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default ErrorBoundary;
