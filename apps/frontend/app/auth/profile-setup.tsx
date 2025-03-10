import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { updateCurrentUser, getCurrentUser } from '@/services/userService';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load user data if available
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getCurrentUser();
        
        // If user has a name, split it into first and last name
        if (user.name) {
          const nameParts = user.name.split(' ');
          if (nameParts.length > 0) {
            setFirstName(nameParts[0]);
            if (nameParts.length > 1) {
              setLastName(nameParts.slice(1).join(' '));
            }
          }
        }
        
        // Set other user data if available
        if (user.age) setAge(user.age.toString());
        
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const handleContinue = async () => {
    // Basic validation
    if (!firstName || !lastName || !age) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare user data for update
      const userData = {
        name: `${firstName} ${lastName}`,
        age: parseInt(age),
        // Add optional fields if they have values
        ...(gender && { gender }),
        ...(height && { height: parseInt(height) }),
        ...(weight && { weight: parseInt(weight) }),
      };
      
      // Update user profile
      await updateCurrentUser(userData);
      
      // Navigate to onboarding questionnaire
      router.push('/onboarding');
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      // Display error message to user
      if (error.response?.data?.message) {
        Alert.alert('Update Failed', error.response.data.message);
      } else {
        Alert.alert('Update Failed', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ 
        title: 'Profile Setup',
        headerStyle: {
          backgroundColor: Theme.COLORS.PRIMARY,
        },
        headerTintColor: Theme.COLORS.WHITE,
      }} />
      <StatusBar style="light" />
      <LinearGradient
        colors={[Theme.COLORS.GRADIENT_START, Theme.COLORS.GRADIENT_END]}
        style={styles.background}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>We'll use this information to personalize your experience</Text>
        </View>

        {initialLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.COLORS.WHITE} />
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>First Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Last Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Age <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity 
                  style={[
                    styles.genderButton,
                    gender === 'male' && styles.genderButtonSelected
                  ]}
                  onPress={() => setGender('male')}
                >
                  <Text 
                    style={[
                      styles.genderButtonText,
                      gender === 'male' && styles.genderButtonTextSelected
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.genderButton,
                    gender === 'female' && styles.genderButtonSelected
                  ]}
                  onPress={() => setGender('female')}
                >
                  <Text 
                    style={[
                      styles.genderButtonText,
                      gender === 'female' && styles.genderButtonTextSelected
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.genderButton,
                    gender === 'other' && styles.genderButtonSelected
                  ]}
                  onPress={() => setGender('other')}
                >
                  <Text 
                    style={[
                      styles.genderButtonText,
                      gender === 'other' && styles.genderButtonTextSelected
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Height"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Weight"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={weight}
                onChangeText={setWeight}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.note}>
            <Text style={styles.required}>*</Text> Required fields
          </Text>

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Theme.COLORS.WHITE} />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  loadingContainer: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Theme.COLORS.WHITE,
    marginTop: 15,
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Theme.COLORS.WHITE,
    opacity: 0.9,
    marginTop: 10,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputHalf: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 8,
  },
  required: {
    color: Theme.COLORS.ERROR,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  genderButtonSelected: {
    backgroundColor: Theme.COLORS.PRIMARY,
    borderColor: Theme.COLORS.PRIMARY,
  },
  genderButtonText: {
    fontSize: 14,
    color: Theme.COLORS.DEFAULT,
  },
  genderButtonTextSelected: {
    color: Theme.COLORS.WHITE,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: Theme.COLORS.MUTED,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
