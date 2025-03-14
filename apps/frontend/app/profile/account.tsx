import React, { useState, useEffect, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';

import Theme from '@/constants/Theme';
import { useAuth } from '@/services/auth/AuthContext';
import { getCurrentUser, getLatestCircadianQuestionnaire, getUserDayStreak } from '@/services/userService';
import { User, CircadianQuestionnaire } from '@/services/api/types';
import ConfirmationModal from '@/components/ConfirmationModal';
import AppHeader from '@/components/AppHeader';

export default function AccountScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [fastingReminderEnabled, setFastingReminderEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [helpCenterModalVisible, setHelpCenterModalVisible] = useState(false);
  const [contactUsModalVisible, setContactUsModalVisible] = useState(false);
  const [privacyPolicyModalVisible, setPrivacyPolicyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  
  // State for user data
  const [userData, setUserData] = useState<User | null>(null);
  const [questionnaire, setQuestionnaire] = useState<CircadianQuestionnaire | null>(null);
  const [dayStreak, setDayStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch user data
  const fetchUserData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      
      console.log('Fetching user data...');
      const [user, questionnaireData, streak] = await Promise.all([
        getCurrentUser(),
        getLatestCircadianQuestionnaire(),
        getUserDayStreak()
      ]);
      
      console.log('User data fetched:', user);
      console.log('Day streak fetched:', streak);
      setUserData(user);
      setQuestionnaire(questionnaireData);
      setDayStreak(streak);
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, []);
  
  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  // Refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Account screen focused, refreshing data...');
      // Don't show loading indicator for better UX when returning from edit profile
      fetchUserData(false);
    }, [fetchUserData])
  );
  
  // Calculate circadian score from questionnaire or use default
  const circadianScore = questionnaire?.chronotype ? 
    (questionnaire.chronotype === 'early' ? 85 : 
     questionnaire.chronotype === 'intermediate' ? 75 : 65) : 
    70;
  
  // Format join date from user data
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Recently joined';
    try {
      // Simple date formatting without external library
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Recently joined';
    }
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
  
  // Handle logout - show confirmation modal
  const handleLogout = () => {
    console.log('handleLogout called');
    setLogoutModalVisible(true);
  };
  
  // Handle delete account - show confirmation modal
  const handleDeleteAccount = () => {
    setDeleteAccountModalVisible(true);
  };
  
  // Handle actual delete account action
  const performDeleteAccount = () => {
    // Navigate to the landing page
    router.push('/');
  };

  // Navigate to developer tools screen
  const navigateToDevTools = () => {
    router.push('/dev-tools');
  };

  return (
    <View style={styles.container}>
      {/* Confirmation Modals */}
      <ConfirmationModal
        visible={logoutModalVisible}
        title="Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={performLogout}
        onCancel={() => setLogoutModalVisible(false)}
        icon="sign-out"
      />
      
      <ConfirmationModal
        visible={deleteAccountModalVisible}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={performDeleteAccount}
        onCancel={() => setDeleteAccountModalVisible(false)}
        isDestructive={true}
        icon="trash"
      />
      
      <ConfirmationModal
        visible={editProfileModalVisible}
        title="Edit Profile"
        message="This feature is coming soon! We're working on adding profile editing capabilities."
        confirmText="OK"
        cancelText=""
        onConfirm={() => setEditProfileModalVisible(false)}
        onCancel={() => setEditProfileModalVisible(false)}
        icon="user-circle"
      />
      
      <ConfirmationModal
        visible={helpCenterModalVisible}
        title="Help Center"
        message="Our help center is coming soon! We're working on comprehensive guides and FAQs to help you get the most out of OptiFit."
        confirmText="OK"
        cancelText=""
        onConfirm={() => setHelpCenterModalVisible(false)}
        onCancel={() => setHelpCenterModalVisible(false)}
        icon="question-circle"
      />
      
      <ConfirmationModal
        visible={contactUsModalVisible}
        title="Contact Us"
        message="Need to get in touch? Our support team will be available soon. We're working on setting up our support channels."
        confirmText="OK"
        cancelText=""
        onConfirm={() => setContactUsModalVisible(false)}
        onCancel={() => setContactUsModalVisible(false)}
        icon="envelope"
      />
      
      <ConfirmationModal
        visible={privacyPolicyModalVisible}
        title="Privacy Policy"
        message="Our privacy policy is being finalized. We take your privacy seriously and will provide detailed information about how we handle your data."
        confirmText="OK"
        cancelText=""
        onConfirm={() => setPrivacyPolicyModalVisible(false)}
        onCancel={() => setPrivacyPolicyModalVisible(false)}
        icon="lock"
      />
      
      <ConfirmationModal
        visible={termsModalVisible}
        title="Terms of Service"
        message="Our terms of service are being finalized. These will outline the rules and guidelines for using OptiFit."
        confirmText="OK"
        cancelText=""
        onConfirm={() => setTermsModalVisible(false)}
        onCancel={() => setTermsModalVisible(false)}
        icon="file-text"
      />
      
      {/* Custom header */}
      <AppHeader 
        title="Account" 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-circle" size={50} color={Theme.COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              setError(null);
              // Retry data fetching
              getCurrentUser()
                .then(user => setUserData(user))
                .catch(err => {
                  console.error('Error fetching user data:', err);
                  setError('Failed to load user data');
                })
                .finally(() => setIsLoading(false));
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitials}>
                  {userData ? 
                    `${userData.firstName?.charAt(0) || ''}${userData.lastName?.charAt(0) || ''}` : 
                    'U'}
                </Text>
              </View>
            </View>
            <Text style={styles.profileName}>
              {userData ? `${userData.firstName} ${userData.lastName}` : 'User'}
            </Text>
            <Text style={styles.profileEmail}>{userData?.email || 'No email'}</Text>
            <Text style={styles.profileJoinDate}>
              Member since {formatJoinDate(userData?.createdAt)}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{circadianScore}</Text>
                <Text style={styles.statLabel}>Circadian Score</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {dayStreak}
                </Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => router.push('/profile/edit')}
            >
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
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
                <View style={styles.buttonInnerContainer}>
                  <ActivityIndicator size="small" color={Theme.COLORS.WHITE} />
                  <Text style={styles.logoutButtonText}>Logging out...</Text>
                </View>
              ) : (
                <View style={styles.buttonInnerContainer}>
                  <FontAwesome name="sign-out" size={18} color={Theme.COLORS.WHITE} style={styles.buttonIcon} />
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteAccountButton}
              onPress={handleDeleteAccount}
            >
              <View style={styles.buttonInnerContainer}>
                <FontAwesome name="trash" size={18} color={Theme.COLORS.ERROR} style={styles.buttonIcon} />
                <Text style={styles.deleteAccountButtonText}>Delete Account</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>OptiFit v1.0.0</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    marginTop: 15,
    marginBottom: 20,
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
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
  buttonInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
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
  logoutButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
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
