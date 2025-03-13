import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Platform,
  Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Theme from '@/constants/Theme';
import AppHeader from '@/components/AppHeader';
import ConfirmationModal from '@/components/ConfirmationModal';


export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [fastingReminderEnabled, setFastingReminderEnabled] = useState(true);
  
  // Modal states
  const [helpCenterModalVisible, setHelpCenterModalVisible] = useState(false);
  const [contactUsModalVisible, setContactUsModalVisible] = useState(false);
  const [privacyPolicyModalVisible, setPrivacyPolicyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  console.log("Settings Screen");

  return (
    <View style={styles.container}>
      {/* Confirmation Modals */}
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
        title="Settings" 
      />
      
      <ScrollView style={styles.scrollContainer}>
        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
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
            onPress={() => setHelpCenterModalVisible(true)}
          >
            <View style={styles.menuItemLabelContainer}>
              <FontAwesome name="question-circle" size={20} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
              <Text style={styles.menuItemLabel}>Help Center</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.COLORS.MUTED} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setContactUsModalVisible(true)}
          >
            <View style={styles.menuItemLabelContainer}>
              <FontAwesome name="envelope" size={20} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
              <Text style={styles.menuItemLabel}>Contact Us</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.COLORS.MUTED} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setPrivacyPolicyModalVisible(true)}
          >
            <View style={styles.menuItemLabelContainer}>
              <FontAwesome name="lock" size={20} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
              <Text style={styles.menuItemLabel}>Privacy Policy</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.COLORS.MUTED} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => setTermsModalVisible(true)}
          >
            <View style={styles.menuItemLabelContainer}>
              <FontAwesome name="file-text" size={20} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
              <Text style={styles.menuItemLabel}>Terms of Service</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.COLORS.MUTED} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/dev-tools')}
          >
            <View style={styles.menuItemLabelContainer}>
              <FontAwesome name="bug" size={20} color={Theme.COLORS.DEFAULT} style={styles.menuItemIcon} />
              <Text style={styles.menuItemLabel}>Developer Tools</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color={Theme.COLORS.MUTED} />
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
  scrollContainer: {
    flex: 1,
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
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
  },
});
