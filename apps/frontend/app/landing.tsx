import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <FontAwesome name="clock-o" size={80} color={Theme.COLORS.WHITE} />
            <Text style={styles.logoText}>OptiFit</Text>
          </View>

          <Text style={styles.tagline}>
            Optimize Your Health with Circadian Rhythm Science
          </Text>

          <View style={styles.featureContainer}>
            <View style={styles.feature}>
              <FontAwesome name="cutlery" size={30} color={Theme.COLORS.WHITE} />
              <Text style={styles.featureTitle}>Smart Meal Timing</Text>
              <Text style={styles.featureDescription}>
                Log meals and get personalized recommendations based on your circadian rhythm
              </Text>
            </View>

            <View style={styles.feature}>
              <FontAwesome name="heartbeat" size={30} color={Theme.COLORS.WHITE} />
              <Text style={styles.featureTitle}>Optimized Workouts</Text>
              <Text style={styles.featureDescription}>
                Schedule exercise when your body is at peak performance
              </Text>
            </View>

            <View style={styles.feature}>
              <FontAwesome name="moon-o" size={30} color={Theme.COLORS.WHITE} />
              <Text style={styles.featureTitle}>Sleep Analysis</Text>
              <Text style={styles.featureDescription}>
                Track sleep patterns and improve your rest quality
              </Text>
            </View>

            <View style={styles.feature}>
              <FontAwesome name="line-chart" size={30} color={Theme.COLORS.WHITE} />
              <Text style={styles.featureTitle}>Circadian Score</Text>
              <Text style={styles.featureDescription}>
                Monitor your overall circadian health with our proprietary scoring system
              </Text>
            </View>
          </View>

          <View style={styles.testimonialContainer}>
            <Text style={styles.testimonialTitle}>What Our Users Say</Text>
            
            <View style={styles.testimonial}>
              <Text style={styles.testimonialText}>
                "OptiFit helped me align my eating schedule with my natural rhythm. I've lost 15 pounds and have so much more energy!"
              </Text>
              <Text style={styles.testimonialAuthor}>- Sarah K.</Text>
            </View>
            
            <View style={styles.testimonial}>
              <Text style={styles.testimonialText}>
                "As an athlete, timing is everything. OptiFit has improved my performance by helping me train at optimal times."
              </Text>
              <Text style={styles.testimonialAuthor}>- Michael T.</Text>
            </View>
          </View>

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
              <Text style={styles.loginButtonText}>Already have an account? Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    marginTop: 10,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '600',
    color: Theme.COLORS.WHITE,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featureContainer: {
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    marginTop: 10,
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 16,
    color: Theme.COLORS.WHITE,
    textAlign: 'center',
    opacity: 0.8,
  },
  testimonialContainer: {
    width: '100%',
    marginBottom: 40,
  },
  testimonialTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    textAlign: 'center',
    marginBottom: 20,
  },
  testimonial: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  testimonialText: {
    fontSize: 16,
    color: Theme.COLORS.WHITE,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: Theme.COLORS.WHITE,
    textAlign: 'right',
    opacity: 0.8,
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  getStartedButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    paddingVertical: 10,
  },
  loginButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
  },
});
