import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Dimensions, View, Text, StyleSheet, Platform } from 'react-native';

import Theme from '@/constants/Theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { ProtectedRoute } from '@/services/auth/ProtectedRoute';

// Get screen dimensions for responsive sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Calculate dynamic sizes based on screen dimensions
const tabBarHeight = Math.max(60, screenHeight * 0.08); // 8% of screen height, minimum 60
const iconSize = Math.max(20, Math.min(24, screenWidth * 0.06)); // 6% of screen width, between 20-24
const fontSize = Math.max(10, Math.min(12, screenWidth * 0.03)); // 3% of screen width, between 10-12

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <TabNavigator />
    </ProtectedRoute>
  );
}

function TabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Theme.COLORS.PRIMARY,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: styles.tabBar,
        headerStyle: {
          backgroundColor: Theme.COLORS.PRIMARY,
        },
        headerTintColor: '#fff',
        headerShown: true,
        tabBarItemStyle: {
          height: tabBarHeight,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <FontAwesome name="home" size={iconSize} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="food-log"
        options={{
          title: 'Food Log',
          tabBarLabel: 'Food',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <FontAwesome name="cutlery" size={iconSize} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="exercise-log"
        options={{
          title: 'Exercise Log',
          tabBarLabel: 'Exercise',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <FontAwesome name="heartbeat" size={iconSize} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'AI Assistant',
          tabBarLabel: 'AI',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <FontAwesome name="comment" size={iconSize} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <FontAwesome name="user" size={iconSize} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

// Styles defined outside component to prevent recreation on each render
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: tabBarHeight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    marginBottom: -5, // This helps position the icon above the label
  },
});
