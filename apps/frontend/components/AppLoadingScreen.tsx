import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import Theme from '@/constants/Theme';

export default function AppLoadingScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Theme.COLORS.GRADIENT_START, Theme.COLORS.GRADIENT_END]}
        style={styles.background}
      >
        <View style={styles.content}>
          {/* App Logo */}
          <FontAwesome name="clock-o" size={70} color={Theme.COLORS.WHITE} />
          <Text style={styles.logoText}>OptiFit</Text>
          
          {/* Modern loading spinner */}
          <View style={styles.spinnerContainer}>
            <ActivityIndicator size="large" color={Theme.COLORS.WHITE} />
          </View>
          
          <Text style={styles.loadingText}>Loading your experience...</Text>
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
    marginBottom: 40,
  },
  spinnerContainer: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Theme.COLORS.WHITE,
    opacity: 0.9,
  },
});
