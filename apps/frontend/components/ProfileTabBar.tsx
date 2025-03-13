import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Platform,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import Theme from '@/constants/Theme';

// Screen width threshold to determine layout style (vertical vs horizontal)
const LAYOUT_THRESHOLD = 600; // Tablets typically have width > 600

// Define the FontAwesome icon type for type safety
type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>['name'];

// Tab configuration for consistent ordering and properties
const TAB_CONFIG = [
  {
    name: 'home',
    title: 'OptiFit',
    label: 'Home',
    icon: 'home' as FontAwesomeIconName,
    path: '/(tabs)/home',
  },
  {
    name: 'food-log',
    title: 'Food Log',
    label: 'Food',
    icon: 'cutlery' as FontAwesomeIconName,
    path: '/(tabs)/food-log',
  },
  {
    name: 'exercise-log',
    title: 'Exercise Log',
    label: 'Exercise',
    icon: 'heartbeat' as FontAwesomeIconName,
    path: '/(tabs)/exercise-log',
  },
  {
    name: 'ai-assistant',
    title: 'AI Assistant',
    label: 'AI',
    icon: 'comment' as FontAwesomeIconName,
    path: '/(tabs)/ai-assistant',
  },
  {
    name: 'learn',
    title: 'Knowledge Base',
    label: 'Learn',
    icon: 'book' as FontAwesomeIconName,
    path: '/(tabs)/learn',
  },
];

export default function ProfileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { width, height } = useWindowDimensions();
  
  // Determine if we're on a large screen (tablet)
  const isLargeScreen = width >= LAYOUT_THRESHOLD;
  
  // Calculate tab bar height based on screen dimensions
  const tabBarHeight = Math.max(60, height * 0.08); // 8% of height, min 60
  
  // Handle tab press
  const handleTabPress = (path: string) => {
    // Use replace instead of push to avoid navigation stack issues
    router.replace(path as any);
  };
  
  // Check if a tab is active
  const isTabActive = (tabPath: string, tabName: string) => {
    // For tabs, check if the pathname matches the tab path
    return pathname === tabPath;
  };
  
  return (
    <View style={[styles.tabBar, { height: tabBarHeight }]}>
      {TAB_CONFIG.map((tab) => {
        const isActive = isTabActive(tab.path, tab.name);
        // Highlight the account icon in the tab bar when on profile pages
        const color = isActive ? Theme.COLORS.PRIMARY : '#888';
        
        // Calculate icon size based on tab bar height
        const iconSize = Math.floor(tabBarHeight * (isLargeScreen ? 0.4 : 0.35));
        const fontSize = Math.max(10, Math.min(12, iconSize * 0.5));
        
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.path)}
          >
            {isLargeScreen ? (
              // Horizontal layout (icon to the left of text) for larger screens
              <View style={styles.horizontalTabButton}>
                <FontAwesome name={tab.icon} size={iconSize} color={color} />
                <Text style={[styles.tabLabel, { color, fontSize, marginLeft: 8 }]}>
                  {tab.label}
                </Text>
              </View>
            ) : (
              // Vertical layout (icon above text) for smaller screens
              <View style={styles.verticalTabButton}>
                <FontAwesome name={tab.icon} size={iconSize} color={color} />
                <Text style={[styles.tabLabel, { color, fontSize, marginTop: 4 }]}>
                  {tab.label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  verticalTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  tabLabel: {
    textAlign: 'center',
  },
});
