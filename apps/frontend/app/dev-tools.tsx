import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { invalidateToken, forceLogout } from '@/services/userService';
import Theme from '@/constants/Theme';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function DevToolsScreen() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [corruptTokenModalVisible, setCorruptTokenModalVisible] = useState(false);
  const [emptyTokenModalVisible, setEmptyTokenModalVisible] = useState(false);
  const [expiredTokenModalVisible, setExpiredTokenModalVisible] = useState(false);
  const [forceLogoutModalVisible, setForceLogoutModalVisible] = useState(false);

  // Handle token invalidation
  const handleInvalidateToken = async (type: 'corrupt' | 'empty' | 'expired') => {
    try {
      setIsProcessing(true);
      console.log(`Invalidating token (type: ${type})...`);
      
      await invalidateToken(type);
      
      // For web, force a hard navigation to ensure a full page reload
      if (Platform.OS === 'web') {
        console.log('Using window.location for web navigation after token invalidation');
        // Set a flag in localStorage to indicate we're logging out due to token invalidation
        localStorage.setItem('optifit_token_invalidated', type);
        
        // Brief success message
        window.alert(`Token successfully invalidated (${type}). You will be redirected to the login page.`);
        
        // Force a full page reload by using window.location
        window.location.href = '/';
        return;
      } else {
        // For native, show a notification and then force logout
        Alert.alert('Success', `Token successfully invalidated (${type}). You will be redirected to the login page.`);
        // Wait a moment for the alert to be seen
        setTimeout(() => {
          forceLogout();
        }, 1500);
      }
    } catch (error) {
      console.error('Error invalidating token:', error);
      
      // Platform-specific error alert
      if (Platform.OS === 'web') {
        window.alert('There was a problem invalidating the token. Please try again.');
      } else {
        Alert.alert('Error', 'There was a problem invalidating the token. Please try again.');
      }
      setIsProcessing(false);
    }
  };
  
  // Handle force logout
  const handleForceLogout = async () => {
    try {
      setIsProcessing(true);
      console.log('Force logout initiated...');
      
      await forceLogout();
      
      // Note: We don't need to handle navigation here
      // as it's all handled by the forceLogout function
    } catch (error) {
      console.error('Error during force logout:', error);
      
      // Platform-specific error alert
      if (Platform.OS === 'web') {
        window.alert('There was a problem with force logout. Please try again.');
      } else {
        Alert.alert('Error', 'There was a problem with force logout. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigate back to account screen
  const navigateBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Confirmation Modals */}
      <ConfirmationModal
        visible={corruptTokenModalVisible}
        title="Corrupt Token"
        message="This will modify your token to make it malformed. The app should detect this and log you out when you try to access protected resources."
        confirmText="Corrupt Token"
        cancelText="Cancel"
        onConfirm={() => {
          setCorruptTokenModalVisible(false);
          handleInvalidateToken('corrupt');
        }}
        onCancel={() => setCorruptTokenModalVisible(false)}
        icon="bug"
        confirmButtonColor={Theme.COLORS.WARNING}
      />
      
      <ConfirmationModal
        visible={emptyTokenModalVisible}
        title="Empty Token"
        message="This will clear your token completely. The app should redirect you to the login screen immediately."
        confirmText="Empty Token"
        cancelText="Cancel"
        onConfirm={() => {
          setEmptyTokenModalVisible(false);
          handleInvalidateToken('empty');
        }}
        onCancel={() => setEmptyTokenModalVisible(false)}
        icon="eraser"
        confirmButtonColor={Theme.COLORS.WARNING}
      />
      
      <ConfirmationModal
        visible={expiredTokenModalVisible}
        title="Expired Token"
        message="This will modify your token to appear expired. The app should attempt to refresh the token and then log you out when that fails."
        confirmText="Expire Token"
        cancelText="Cancel"
        onConfirm={() => {
          setExpiredTokenModalVisible(false);
          handleInvalidateToken('expired');
        }}
        onCancel={() => setExpiredTokenModalVisible(false)}
        icon="clock-o"
        confirmButtonColor={Theme.COLORS.INFO}
      />
      
      <ConfirmationModal
        visible={forceLogoutModalVisible}
        title="Force Logout"
        message="This will force a logout regardless of token state. Use this if you're stuck in an authentication loop."
        confirmText="Force Logout"
        cancelText="Cancel"
        onConfirm={() => {
          setForceLogoutModalVisible(false);
          handleForceLogout();
        }}
        onCancel={() => setForceLogoutModalVisible(false)}
        icon="sign-out"
        confirmButtonColor={Theme.COLORS.ERROR}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={navigateBack}
        >
          <FontAwesome name="chevron-left" size={18} color={Theme.COLORS.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Developer Tools</Text>
        <View style={styles.backButton} />
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <FontAwesome name="info-circle" size={24} color={Theme.COLORS.INFO} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            These tools are for testing authentication error handling. Use them to simulate different token error scenarios.
          </Text>
        </View>
        
        {/* Token Invalidation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Invalidation</Text>
          <Text style={styles.sectionDescription}>
            These options allow you to test how the app handles different types of token errors.
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.corruptButton, isProcessing && styles.disabledButton]}
            onPress={() => setCorruptTokenModalVisible(true)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <View style={styles.buttonInnerContainer}>
                <ActivityIndicator size="small" color={Theme.COLORS.WHITE} />
                <Text style={styles.buttonText}>Processing...</Text>
              </View>
            ) : (
              <View style={styles.buttonInnerContainer}>
                <FontAwesome name="chain-broken" size={18} color={Theme.COLORS.WHITE} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Corrupt Token</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={styles.buttonDescription}>
            Makes the token malformed. The app should detect this and log you out when you try to access protected resources.
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.emptyButton, isProcessing && styles.disabledButton]}
            onPress={() => setEmptyTokenModalVisible(true)}
            disabled={isProcessing}
          >
            <View style={styles.buttonInnerContainer}>
              <FontAwesome name="eraser" size={18} color={Theme.COLORS.WHITE} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Empty Token</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.buttonDescription}>
            Clears the token completely. The app should redirect you to the login screen immediately.
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.expiredButton, isProcessing && styles.disabledButton]}
            onPress={() => setExpiredTokenModalVisible(true)}
            disabled={isProcessing}
          >
            <View style={styles.buttonInnerContainer}>
              <FontAwesome name="clock-o" size={18} color={Theme.COLORS.WHITE} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Expire Token</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.buttonDescription}>
            Modifies the token to appear expired. The app should attempt to refresh the token and then log you out when that fails.
          </Text>
        </View>
        
        {/* Force Logout Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Actions</Text>
          <Text style={styles.sectionDescription}>
            Use these options if you're stuck in an authentication loop or other error state.
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton, isProcessing && styles.disabledButton]}
            onPress={() => setForceLogoutModalVisible(true)}
            disabled={isProcessing}
          >
            <View style={styles.buttonInnerContainer}>
              <FontAwesome name="sign-out" size={18} color={Theme.COLORS.WHITE} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Force Logout</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.buttonDescription}>
            Forces a logout regardless of token state. Use this if you're stuck in an authentication loop.
          </Text>
        </View>
        
        {/* Testing Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing Instructions</Text>
          <Text style={styles.instructionText}>
            1. Use one of the token invalidation options above.
          </Text>
          <Text style={styles.instructionText}>
            2. Navigate to another screen that requires authentication.
          </Text>
          <Text style={styles.instructionText}>
            3. Observe how the app handles the invalid token.
          </Text>
          <Text style={styles.instructionText}>
            4. If you get stuck, use the Force Logout option.
          </Text>
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
    justifyContent: 'space-between',
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: '#e6f7ff',
    padding: 15,
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Theme.COLORS.INFO,
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    marginBottom: 20,
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  corruptButton: {
    backgroundColor: Theme.COLORS.WARNING,
  },
  emptyButton: {
    backgroundColor: Theme.COLORS.INFO,
  },
  expiredButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
  },
  logoutButton: {
    backgroundColor: Theme.COLORS.ERROR,
  },
  disabledButton: {
    backgroundColor: Theme.COLORS.MUTED,
  },
  buttonInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDescription: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  instructionText: {
    fontSize: 14,
    color: Theme.COLORS.DEFAULT,
    marginBottom: 10,
    lineHeight: 20,
  },
});
