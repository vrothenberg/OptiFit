import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { 
  Dimensions, 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  useWindowDimensions,
  ScaledSize 
} from 'react-native';

import Theme from '@/constants/Theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { ProtectedRoute } from '@/services/auth/ProtectedRoute';
import AppHeader from '@/components/AppHeader';

// Screen width threshold to determine layout style (vertical vs horizontal)
const LAYOUT_THRESHOLD = 600; // Tablets typically have width > 600

// Define the FontAwesome icon type for type safety
type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>['name'];

// Tab configuration for consistent ordering and properties
const TAB_CONFIG = [
  {
    name: 'index',
    title: 'OptiFit',
    label: 'Home',
    icon: 'home' as FontAwesomeIconName,
  },
  {
    name: 'food-log',
    title: 'Food Log',
    label: 'Food',
    icon: 'cutlery' as FontAwesomeIconName,
  },
  {
    name: 'exercise-log',
    title: 'Exercise Log',
    label: 'Exercise',
    icon: 'heartbeat' as FontAwesomeIconName,
  },
  {
    name: 'ai-assistant',
    title: 'AI Assistant',
    label: 'AI',
    icon: 'comment' as FontAwesomeIconName,
  },
  {
    name: 'learn',
    title: 'Knowledge Base',
    label: 'Learn',
    icon: 'book' as FontAwesomeIconName,
  },
];

// Styles defined outside component to prevent recreation on each render
const styles = StyleSheet.create({
  verticalTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  verticalTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalTabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabLabel: {
    textAlign: 'center',
  },
});

// Custom tab bar button that adapts to screen size
function CustomTabButton({ 
  icon, 
  label, 
  color, 
  isLargeScreen,
  tabBarHeight
}: { 
  icon: FontAwesomeIconName;
  label: string;
  color: string;
  isLargeScreen: boolean;
  tabBarHeight: number;
}) {
  // Calculate icon size based on tab bar height
  const iconSize = Math.floor(tabBarHeight * (isLargeScreen ? 0.4 : 0.35));
  const fontSize = Math.max(10, Math.min(12, iconSize * 0.5));

  if (isLargeScreen) {
    // Horizontal layout (icon to the left of text) for larger screens
    return (
      <View style={styles.horizontalTabButton}>
        <FontAwesome name={icon} size={iconSize} color={color} />
        <Text style={[styles.tabLabel, { color, fontSize, marginLeft: 8 }]}>
          {label}
        </Text>
      </View>
    );
  } else {
    // Vertical layout (icon above text) for smaller screens
    
    // Calculate the total height of content (icon + spacing + text)
    const iconHeight = iconSize;
    const textHeight = fontSize * 1.2; // Approximate text height based on font size
    const spacingHeight = 4; // Space between icon and text
    const totalContentHeight = iconHeight + textHeight + spacingHeight;
    
    // Calculate top margin to center content in tab bar
    // Subtract any padding that might be applied to the container
    const verticalPadding = 0; // Total vertical padding (top + bottom)
    const availableHeight = tabBarHeight - verticalPadding;
    const topMargin = Math.max(0, (availableHeight - totalContentHeight) / 2);

    return (
      <View style={styles.verticalTabButton}>
        <View style={styles.verticalTabContent}>
          <FontAwesome name={icon} size={iconSize} color={color} />
          <Text style={[styles.tabLabel, { color, fontSize, marginTop: spacingHeight }]}>
            {label}
          </Text>
        </View>
      </View>
    );
  }
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
  const { width, height } = useWindowDimensions();
  const [dimensions, setDimensions] = useState({ width, height });
  
  // Update dimensions when screen size changes (e.g., rotation)
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    
    return () => subscription.remove();
  }, []);
  
  // Determine if we're on a large screen (tablet)
  const isLargeScreen = dimensions.width >= LAYOUT_THRESHOLD;
  
  // Calculate tab bar height based on screen dimensions
  const tabBarHeight = Math.max(60, dimensions.height * 0.08); // 8% of height, min 60
  
  return (
    <Tabs
      screenOptions={({ route }) => {
        // Get the tab configuration for the current route
        const tab = TAB_CONFIG.find(tab => tab.name === route.name);
        
        return {
          tabBarActiveTintColor: Theme.COLORS.PRIMARY,
          tabBarInactiveTintColor: '#888',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            height: tabBarHeight,
            paddingTop: 0,
            paddingBottom: 0,
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
          // Hide the default label since we're using custom tab bar buttons
          tabBarLabel: () => null,
          tabBarItemStyle: {
            height: tabBarHeight,
          },
          // Use custom header with AppHeader component
          header: ({ navigation, route, options }) => (
            <AppHeader 
              title={tab?.title || 'OptiFit'} 
              titleSize={route.name === 'index' ? 24 : 20}
            />
          ),
          // Add padding between header and content
          contentStyle: {
            paddingTop: 10,
          },
        };
      }}>
      
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <CustomTabButton
                icon={tab.icon}
                label={tab.label}
                color={color}
                isLargeScreen={isLargeScreen}
                tabBarHeight={tabBarHeight}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
