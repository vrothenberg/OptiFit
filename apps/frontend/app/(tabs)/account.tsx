import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Image,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Theme from '@/constants/Theme';
import { useAuth } from '@/services/auth/AuthContext';

export default function AccountScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [fastingReminderEnabled, setFastingReminderEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Mock user data
  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    joinDate: 'January 15, 2025',
    circadianScore: 78,
    streak: 14,
  };
  
  // Function to perform the actual logout
  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Logging out user...');
      
      // Call the logout function from AuthContext
      // This will handle token clearing, state updates, and navigation
      await logout();
      
      // Note: We don't need to handle navigation here
      // as it's all handled by the AuthContext logout function
      
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Platform-specific error alert
      if (Platform.OS === 'web') {
        window.alert('There was a problem logging out. Please try again.');
      } else {
        Alert.alert('Logout Error', 'There was a problem logging out. Please try again.');
      }
    } finally {
      // Note: We don't need to set isLoggingOut to false here
      // as the component will be unmounted after logout
    }
  };
  
  // Handle logout with platform-specific confirmation
  const handleLogout = () => {
    console.log('handleLogout called');
    
    if (Platform.OS === 'web') {
      // Use browser's native confirm dialog for web
      if (window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
    } else {
      // Use React Native Alert for native platforms
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            onPress: performLogout,
          },
        ]
      );
    }
  };
  
  // Handle delete account
  const handleDeleteAccount = () => {
    if (Platform.OS === 'web') {
      // Use browser's native confirm dialog for web
      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Navigate to the landing page
        router.push('/');
      }
    } else {
      // Use React Native Alert for native platforms
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              // Navigate to the landing page
              router.push('/');
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitials}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <Text style={styles.profileJoinDate}>Member since {user.joinDate}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.circadianScore}</Text>
              <Text style={styles.statLabel}>Circadian Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.alert('Edit Profile: This feature is coming soon!');
              } else {
                Alert.alert('Edit Profile', 'This feature is coming soon!');
              }
            }}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <FontAwesome name="bell" size={20} color={Theme.COLORS.DEFAULT} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e0e0e0', true: Theme.COLORS.PRIMARY }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <FontAwesome name="moon-o" size={20} color={Theme.COLORS.DEFAULT} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#e0e0e0', true: Theme.COLORS.PRIMARY }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <FontAwesome name="clock-o" size={20} color={Theme.COLORS.DEFAULT} style={styles.settingIcon} />
              <Text style={styles.settingLabel}>Fasting Reminders</Text>
            </View>
            <Switch
              value={fastingReminderEnabled}
              onValueChange={setFastingReminderEnabled}
              trackColor={{ false: '#e0e0e0', true: Theme.COLORS.PRIMARY }}
              thumbColor="#fff"
            />
          </View>
        </View>
        
        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.alert('Help Center: This feature is coming soon!');
              } else {
                Alert.alert('Help Center', 'This feature is coming soon!');
              }
            }}
          >
            <View style={styles.menuItemLabelContainer}>
              <FontAwesome name="question-circle" size={20} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
              <Text style={styles.menuItemLabel}>Help Center</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.COLORS.MUTED} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.alert('Contact Us: This feature is coming soon!');
              } else {
                Alert.alert('Contact Us', 'This feature is coming soon!');
              }
            }}
          >
            <View style={styles.menuItemLabelContainer}>
              <FontAwesome name="envelope" size={20} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
              <Text style={styles.menuItemLabel}>Contact Us</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.COLORS.MUTED} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.alert('Privacy Policy: This feature is coming soon!');
              } else {
                Alert.alert('Privacy Policy', 'This feature is coming soon!');
              }
            }}
          >
            <View style={styles.menuItemLabelContainer}>
              <FontAwesome name="lock" size={20} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
              <Text style={styles.menuItemLabel}>Privacy Policy</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.COLORS.MUTED} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.alert('Terms of Service: This feature is coming soon!');
              } else {
                Alert.alert('Terms of Service', 'This feature is coming soon!');
              }
            }}
          >
            <View style={styles.menuItemLabelContainer}>
              <FontAwesome name="file-text" size={20} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
              <Text style={styles.menuItemLabel}>Terms of Service</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.COLORS.MUTED} />
          </TouchableOpacity>
        </View>
        
        {/* Account Actions */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.logoutButton, isLoggingOut && styles.disabledButton]}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Theme.COLORS.WHITE} />
                <Text style={styles.logoutButtonText}>Logging out...</Text>
              </View>
            ) : (
              <Text style={styles.logoutButtonText}>Logout</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>OptiFit v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Theme.COLORS.PRIMARY,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
  },
  scrollContainer: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: Theme.COLORS.MUTED,
    marginBottom: 5,
  },
  profileJoinDate: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.COLORS.PRIMARY,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  editProfileButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.COLORS.PRIMARY,
  },
  editProfileButtonText: {
    fontSize: 16,
    color: Theme.COLORS.PRIMARY,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    marginRight: 15,
  },
  menuItemLabel: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  logoutButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: Theme.COLORS.MUTED,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  deleteAccountButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.COLORS.ERROR,
  },
  deleteAccountButtonText: {
    color: Theme.COLORS.ERROR,
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
  },
});
