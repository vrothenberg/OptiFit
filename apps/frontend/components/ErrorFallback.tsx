import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Theme from '@/constants/Theme';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
  showHomeButton?: boolean;
}

/**
 * A custom error fallback component that provides a more user-friendly
 * error page than the default 404 page.
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  message = 'Something went wrong',
  showHomeButton = true,
}) => {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/');
  };

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      // If no reset function is provided, just reload the page
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Theme.COLORS.GRADIENT_START, Theme.COLORS.GRADIENT_END]}
        style={styles.background}
      >
        <View style={styles.content}>
          <FontAwesome name="exclamation-circle" size={70} color={Theme.COLORS.WHITE} />
          
          <Text style={styles.errorTitle}>{message}</Text>
          
          {error && error.message && (
            <Text style={styles.errorMessage}>
              {error.message}
            </Text>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={handleRetry}
            >
              <FontAwesome name="refresh" size={16} color={Theme.COLORS.WHITE} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
            
            {showHomeButton && (
              <TouchableOpacity 
                style={[styles.button, styles.homeButton]}
                onPress={handleGoHome}
              >
                <FontAwesome name="home" size={16} color={Theme.COLORS.DEFAULT} style={styles.buttonIcon} />
                <Text style={[styles.buttonText, styles.homeButtonText]}>Go to Home</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

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
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Theme.COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 20,
  },
  button: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: Theme.COLORS.WHITE,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  homeButtonText: {
    color: Theme.COLORS.DEFAULT,
  },
});

export default ErrorFallback;
