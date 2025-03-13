import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Pressable
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/services/auth/AuthContext';
import Theme from '@/constants/Theme';

interface AccountDropdownProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function AccountDropdown({ isVisible, onClose }: AccountDropdownProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [animation] = useState(new Animated.Value(0));
  
  // Animate the dropdown when visibility changes
  useEffect(() => {
    Animated.timing(animation, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
    
    // If dropdown is closing, wait for animation to complete before calling onClose
    if (!isVisible) {
      setTimeout(onClose, 200);
    }
  }, [isVisible]);
  
  // Handle navigation to account page
  const handleAccountPress = () => {
    router.replace('/profile/account');
    onClose();
  };
  
  // Handle logout
  const handleLogoutPress = async () => {
    onClose();
    // Small delay to ensure dropdown closes before logout process starts
    setTimeout(async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }, 100);
  };
  
  // Animation values
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0]
  });
  
  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  
  if (!isVisible) return null;
  
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.dropdown,
                {
                  opacity,
                  transform: [{ translateY }]
                }
              ]}
            >
              {/* Arrow/caret pointing to account icon */}
              <View style={styles.arrow} />
              
              <Pressable
                onPress={handleAccountPress}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed
                ]}
              >
                <FontAwesome name="id-card" size={16} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Account</Text>
              </Pressable>
              
              <View style={styles.divider} />
              
              <Pressable
                onPress={handleLogoutPress}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed
                ]}
              >
                <FontAwesome name="sign-out" size={16} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Logout</Text>
              </Pressable>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
  },
  dropdown: {
    position: 'absolute',
    top: 60, // Position below header
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    width: 150,
    zIndex: 1000,
    // Add a subtle border
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    // Add padding for the arrow
    paddingTop: 10,
  },
  arrow: {
    position: 'absolute',
    top: -10,
    right: 15,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
    // Shadow for the arrow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    borderRadius: 4,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuItemIcon: {
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    width: '100%',
  }
});
