import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';

import Theme from '@/constants/Theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { ProtectedRoute } from '@/services/auth/ProtectedRoute';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

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
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Theme.COLORS.PRIMARY,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 8, // Reduced horizontal padding to give more space for labels
        },
        tabBarLabelStyle: {
          fontSize: 12, // Smaller font size for labels
        },
        headerStyle: {
          backgroundColor: Theme.COLORS.PRIMARY,
        },
        headerTintColor: '#fff',
        headerShown: true,
        // Add extra padding for the first and last tab items
        tabBarItemStyle: 
          route.name === 'food-log' 
            ? { paddingLeft: 8 } // Extra padding for leftmost icon
            : route.name === 'account' 
              ? { paddingRight: 8 } // Extra padding for rightmost icon
              : undefined,
      })}>
      <Tabs.Screen
        name="food-log"
        options={{
          title: 'Food Log',
          tabBarIcon: ({ color }) => <TabBarIcon name="cutlery" color={color} />,
          tabBarLabel: 'Food',
        }}
      />
      <Tabs.Screen
        name="exercise-log"
        options={{
          title: 'Exercise Log',
          tabBarIcon: ({ color }) => <TabBarIcon name="heartbeat" color={color} />,
          tabBarLabel: 'Workout', // Changed from 'Exercise' to a shorter word
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <View style={{
              position: 'absolute',
              top: -15, // Reduced from -25 to prevent overlap
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <View style={{
                backgroundColor: Theme.COLORS.PRIMARY,
                width: 40, // Reduced from 50
                height: 40, // Reduced from 50
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
              }}>
                <FontAwesome 
                  name="home" 
                  size={22} // Reduced from 28
                  color="#fff" 
                />
              </View>
            </View>
          ),
          tabBarLabel: 'Home',
          tabBarLabelStyle: {
            marginTop: 10, // Add some margin to prevent overlap with the icon
          },
        }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color }) => <TabBarIcon name="comment" color={color} />,
          tabBarLabel: 'AI', // Shorter label to prevent truncation
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          tabBarLabel: 'Account',
        }}
      />
    </Tabs>
  );
}
