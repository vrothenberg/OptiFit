import React from 'react';
import { Stack } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { usePathname } from 'expo-router';

import { ProtectedRoute } from '@/services/auth/ProtectedRoute';
import ProfileTabBar from '@/components/ProfileTabBar';

export default function ProfileLayout() {
  return (
    <ProtectedRoute>
      <ProfileStack />
    </ProtectedRoute>
  );
}

function ProfileStack() {
  // Calculate tab bar height for bottom padding
  const { height } = useWindowDimensions();
  const tabBarHeight = Math.max(60, height * 0.08); // 8% of height, min 60
  
  return (
    <View style={{ flex: 1 }}>
      {/* Stack for profile pages with bottom padding for tab bar */}
      <View style={{ flex: 1, paddingBottom: tabBarHeight }}>
        <Stack 
          screenOptions={{ 
            headerShown: false,
          }}
        >
          <Stack.Screen name="account" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="edit" />
        </Stack>
      </View>
      
      {/* Include the tab bar at the bottom */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <ProfileTabBar />
      </View>
    </View>
  );
}
