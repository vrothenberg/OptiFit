import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Theme from '@/constants/Theme';

export default function DevToolsIndex() {
  const router = useRouter();

  const navigateBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Developer Tools' }} />
      
      <ScrollView style={styles.scrollContainer}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <FontAwesome name="info-circle" size={24} color={Theme.COLORS.INFO} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            These tools are for testing and development purposes. Select a tool from the options below.
          </Text>
        </View>
        
        {/* Authentication Tools Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication Tools</Text>
          <Text style={styles.sectionDescription}>
            Tools for testing authentication and token handling.
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.authButton]}
            onPress={() => router.push('/dev-tools/auth-tools' as any)}
          >
            <View style={styles.buttonInnerContainer}>
              <FontAwesome name="key" size={18} color={Theme.COLORS.WHITE} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Auth Testing Tools</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.buttonDescription}>
            Test token invalidation, force logout, and other authentication scenarios.
          </Text>
        </View>
        
        {/* Food Search Demo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Search</Text>
          <Text style={styles.sectionDescription}>
            Demo of the food search functionality with autocomplete.
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.foodButton]}
            onPress={() => router.push('/dev-tools/food-search-demo' as any)}
          >
            <View style={styles.buttonInnerContainer}>
              <FontAwesome name="search" size={18} color={Theme.COLORS.WHITE} style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Food Search Demo</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.buttonDescription}>
            Test the food search functionality with autocomplete suggestions using the Edamam API.
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
    marginBottom: 10,
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
  authButton: {
    backgroundColor: Theme.COLORS.WARNING,
  },
  foodButton: {
    backgroundColor: Theme.COLORS.SUCCESS,
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
    marginBottom: 10,
    paddingHorizontal: 5,
  },
});
