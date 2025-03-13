import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Platform,
  StatusBar
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Theme from '@/constants/Theme';

interface AppHeaderProps {
  title: string;
  titleSize?: number;
  headerBackgroundColor?: string;
  showSettingsButton?: boolean;
  showAccountButton?: boolean;
  onSettingsPress?: () => void;
  onAccountPress?: () => void;
}

export default function AppHeader({
  title,
  titleSize,
  headerBackgroundColor,
  showSettingsButton = true,
  showAccountButton = true,
  onSettingsPress,
  onAccountPress
}: AppHeaderProps) {
  const router = useRouter();

  // Default handlers if not provided
  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      // Navigate to settings page
      router.push('/settings' as any);
    }
  };

  const handleAccountPress = () => {
    if (onAccountPress) {
      onAccountPress();
    } else {
      // Navigate to account page
      router.push('/profile/account');
    }
  };

  return (
    <View style={styles.header}>
      {/* Left: Title */}
      <Text style={[styles.headerTitle, titleSize ? { fontSize: titleSize } : null]}>{title}</Text>
      
      {/* Right: Action Buttons */}
      <View style={styles.headerActions}>
        {showSettingsButton && (
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleSettingsPress}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <FontAwesome name="gear" size={22} color="#888888" />
          </TouchableOpacity>
        )}
        
        {showAccountButton && (
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={handleAccountPress}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <FontAwesome name="user-circle" size={22} color="#888888" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 10,
      },
      android: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 5 : 5,
      },
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.COLORS.PRIMARY,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 20,
    padding: 5,
  },
});
