import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Platform,
  StatusBar
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

import Theme from '@/constants/Theme';
import AccountDropdown from './AccountDropdown';

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
  const pathname = usePathname();
  
  // Check if we're on a profile page
  const isProfilePage = pathname?.startsWith('/profile');
  // Check if we're specifically on the account page
  const isAccountPage = pathname === '/profile/account';
  // Check if we're on the settings page
  const isSettingsPage = pathname === '/profile/settings';

  // Default handlers if not provided
  const handleSettingsPress = () => {
    if (onSettingsPress) {
      console.log("Calling onSettingsPress...");
      onSettingsPress();
    } else {
      // Navigate to settings page
      console.log('Navigating to settings page...');
      // Use replace instead of push to avoid navigation stack issues
      router.replace('/profile/settings');
    }
  };

  const [accountDropdownVisible, setAccountDropdownVisible] = useState(false);
  
  const handleAccountPress = () => {
    if (onAccountPress) {
      onAccountPress();
    } else {
      // Toggle the account dropdown
      setAccountDropdownVisible(!accountDropdownVisible);
    }
  };
  
  const handleCloseDropdown = () => {
    setAccountDropdownVisible(false);
  };

  return (
    <View style={styles.header}>
      {/* Account Dropdown */}
      <AccountDropdown 
        isVisible={accountDropdownVisible}
        onClose={handleCloseDropdown}
      />
      {/* Left: Title */}
      <Text style={[styles.headerTitle, titleSize ? { fontSize: titleSize } : null]}>{title}</Text>
      
      {/* Right: Action Buttons */}
      <View style={styles.headerActions}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleSettingsPress}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <FontAwesome 
            name="gear" 
            size={24} 
            color={isSettingsPage ? Theme.COLORS.PRIMARY : "#888888"} 
            accessibilityLabel="Settings"
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleAccountPress}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <FontAwesome 
            name="user-circle" 
            size={24} 
            color={isAccountPage ? Theme.COLORS.PRIMARY : "#888888"} 
            accessibilityLabel="Account"
          />
        </TouchableOpacity>
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
