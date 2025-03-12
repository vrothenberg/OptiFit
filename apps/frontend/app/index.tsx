import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';
import { useAuth } from '@/services/auth/AuthContext';
import AppLoadingScreen from '@/components/AppLoadingScreen';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect to tabs if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Add a small delay to ensure Root Layout is mounted
      const timer = setTimeout(() => {
        router.replace('/(tabs)');
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);
  
  // Check if we're coming from a logout or token invalidation (for web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Check for normal logout
      const loggingOut = localStorage.getItem('optifit_logging_out');
      if (loggingOut) {
        localStorage.removeItem('optifit_logging_out');
        // No need to navigate, we're already at the root
      }
      
      // Check for auth failure
      const authFailure = localStorage.getItem('optifit_auth_failure');
      if (authFailure) {
        localStorage.removeItem('optifit_auth_failure');
        // No need to navigate, we're already at the root
      }
      
      // Check for token invalidation
      const tokenInvalidated = localStorage.getItem('optifit_token_invalidated');
      if (tokenInvalidated) {
        const invalidationType = tokenInvalidated;
        localStorage.removeItem('optifit_token_invalidated');
        console.log(`Landing page detected token was invalidated (${invalidationType})`);
      }
    }
  }, []);
  
  // Show loading screen while checking authentication
  if (isLoading) {
    return <AppLoadingScreen />;
  }

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Theme.COLORS.GRADIENT_START, Theme.COLORS.GRADIENT_END]}
        style={styles.background}
      >
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <FontAwesome name="clock-o" size={50} color={Theme.COLORS.WHITE} />
            <Text style={styles.logoText}>OptiFit</Text>
            <Text style={styles.tagline}>
              Optimize Your Health with Circadian Rhythm
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureRow}>
              <View style={styles.feature}>
                <FontAwesome name="cutlery" size={24} color={Theme.COLORS.WHITE} />
                <Text style={styles.featureTitle}>Smart Meal Timing</Text>
              </View>
              
              <View style={styles.feature}>
                <FontAwesome name="heartbeat" size={24} color={Theme.COLORS.WHITE} />
                <Text style={styles.featureTitle}>Optimized Workouts</Text>
              </View>
            </View>
            
            <View style={styles.featureRow}>
              <View style={styles.feature}>
                <FontAwesome name="moon-o" size={24} color={Theme.COLORS.WHITE} />
                <Text style={styles.featureTitle}>Sleep Analysis</Text>
              </View>
              
              <View style={styles.feature}>
                <FontAwesome name="line-chart" size={24} color={Theme.COLORS.WHITE} />
                <Text style={styles.featureTitle}>Circadian Score</Text>
              </View>
            </View>
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={handleGetStarted}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
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
  contentContainer: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 5,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    marginTop: 0,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.COLORS.WHITE,
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 10,
  },
  featuresGrid: {
    width: '100%',
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feature: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 8,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 2,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    marginTop: 5,
    textAlign: 'center',
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  getStartedButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: Theme.COLORS.SECONDARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginButtonText: {
    color: Theme.COLORS.DEFAULT,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
