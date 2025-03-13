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
import { completeRegistration, getCurrentUser } from '@/services/userService';
import apiClient from '@/services/api/client';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';
import { useAuth } from '@/services/auth/AuthContext';
import DatePicker from '@/components/DatePicker';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Validation states
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [dateOfBirthError, setDateOfBirthError] = useState<string | null>(null);
  const [heightError, setHeightError] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  // Clear errors when inputs change
  useEffect(() => {
    setFirstNameError(null);
    setGeneralError(null);
  }, [firstName]);
  
  useEffect(() => {
    setLastNameError(null);
    setGeneralError(null);
  }, [lastName]);
  
  useEffect(() => {
    setDateOfBirthError(null);
    setGeneralError(null);
  }, [dateOfBirth]);
  
  useEffect(() => {
    setHeightError(null);
  }, [height]);
  
  useEffect(() => {
    setWeightError(null);
  }, [weight]);

  // Redirect to tabs if already authenticated and has completed profile
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (isAuthenticated) {
          // Get current user to check if profile is complete
          const user = await getCurrentUser();
          
          // If user has a complete profile (not the default placeholder values)
          if (user.firstName !== 'Pending' && user.lastName !== 'Registration') {
            router.replace('/(tabs)');
          }
        }
      } catch (error) {
        console.log('Error checking authentication status:', error);
      }
    };
    
    checkAuthStatus();
  }, [isAuthenticated, router]);

  // Load user data if available, with a delay to ensure token is stored
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Add a shorter delay since we're using AuthContext
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we have a token before trying to get user data
        const isAuth = await apiClient.isAuthenticated();
        console.log('Is authenticated:', isAuth);
        
        if (isAuth) {
          const user = await getCurrentUser();
          console.log('User data loaded:', user);
          
          // Set first and last name if available
          if (user.firstName && user.firstName !== 'Pending') {
            setFirstName(user.firstName);
          }
          
          if (user.lastName && user.lastName !== 'Registration') {
            setLastName(user.lastName);
          }
          
          // Set profile data if available
          if (user.profile) {
            if (user.profile.gender) {
              setGender(user.profile.gender);
            }
            
            if (user.profile.heightCm) {
              setHeight(user.profile.heightCm.toString());
            }
            
            if (user.profile.weightKg) {
              setWeight(user.profile.weightKg.toString());
            }
          }
        } else {
          console.log('No authentication token found, skipping user data load');
        }
      } catch (error) {
        console.log('Error loading user data (expected for new users):', error);
        // For new users, this is expected - don't show an error
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Validate numeric input
  const validateNumeric = (value: string, fieldName: string, setError: (error: string | null) => void): boolean => {
    if (!value) {
      return true; // Empty is valid for optional fields
    }
    
    const num = Number(value);
    if (isNaN(num)) {
      setError(`${fieldName} must be a number`);
      return false;
    }
    
    if (num <= 0) {
      setError(`${fieldName} must be greater than 0`);
      return false;
    }
    
    return true;
  };
  
  const handleContinue = async () => {
    // Reset all errors
    setFirstNameError(null);
    setLastNameError(null);
    setDateOfBirthError(null);
    setHeightError(null);
    setWeightError(null);
    setGeneralError(null);
    
    // Validate all fields
    let isValid = true;
    
    if (!firstName) {
      setFirstNameError('First name is required');
      isValid = false;
    }
    
    if (!lastName) {
      setLastNameError('Last name is required');
      isValid = false;
    }
    
    if (!dateOfBirth) {
      setDateOfBirthError('Date of birth is required');
      isValid = false;
    } else {
      try {
        new Date(dateOfBirth);
      } catch (e) {
        setDateOfBirthError('Invalid date format');
        isValid = false;
      }
    }
    
    // Optional fields validation
    if (height && !validateNumeric(height, 'Height', setHeightError)) {
      isValid = false;
    }
    
    if (weight && !validateNumeric(weight, 'Weight', setWeightError)) {
      isValid = false;
    }
    
    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare profile data for completion
      const profileData = {
        firstName,
        lastName,
        dateOfBirth,
        // Add optional fields if they have values
        ...(gender && { gender }),
        ...(height && { heightCm: parseInt(height) }),
        ...(weight && { weightKg: parseInt(weight) }),
        ...(gender && { activityLevel: 'moderate' }), // Default value
      };
      
      // Complete registration with profile data
      await completeRegistration(profileData);
      
      // Navigate to onboarding questionnaire
      router.push('/onboarding');
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      // Display specific error message
      if (error.message) {
        // Check for specific error types
        if (error.message.includes('first') || error.message.includes('firstName')) {
          setFirstNameError(error.message);
        } else if (error.message.includes('last') || error.message.includes('lastName')) {
          setLastNameError(error.message);
        } else if (error.message.includes('date') || error.message.includes('birth')) {
          setDateOfBirthError(error.message);
        } else if (error.message.includes('height')) {
          setHeightError(error.message);
        } else if (error.message.includes('weight')) {
          setWeightError(error.message);
        } else if (error.message.includes('session') || error.message.includes('expired')) {
          // Handle session expiration
          setGeneralError('Your session has expired. Please log in again.');
          // Redirect to login after a delay
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
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
          {generalError && (
            <View style={styles.generalErrorContainer}>
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          )}
          
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>First Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, firstNameError && styles.inputError]}
                placeholder="First Name"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={firstName}
                onChangeText={setFirstName}
              />
              {firstNameError && <Text style={styles.errorText}>{firstNameError}</Text>}
            </View>
            
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Last Name <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, lastNameError && styles.inputError]}
                placeholder="Last Name"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={lastName}
                onChangeText={setLastName}
              />
              {lastNameError && <Text style={styles.errorText}>{lastNameError}</Text>}
            </View>
          </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>Date of Birth <Text style={styles.required}>*</Text></Text>
                <DatePicker
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                  placeholder="Select date of birth"
                />
                {dateOfBirthError && <Text style={styles.errorText}>{dateOfBirthError}</Text>}
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
                style={[styles.input, heightError && styles.inputError]}
                placeholder="Height"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
              />
              {heightError && <Text style={styles.errorText}>{heightError}</Text>}
            </View>
            
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={[styles.input, weightError && styles.inputError]}
                placeholder="Weight"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={weight}
                onChangeText={setWeight}
                keyboardType="number-pad"
              />
              {weightError && <Text style={styles.errorText}>{weightError}</Text>}
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
  errorText: {
    color: Theme.COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  inputError: {
    borderColor: Theme.COLORS.ERROR,
  },
  generalErrorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  generalErrorText: {
    color: Theme.COLORS.ERROR,
    fontSize: 14,
    textAlign: 'center',
  },
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
