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
import { updateCurrentUser, getCurrentUser } from '@/services/userService';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';
import { useAuth } from '@/services/auth/AuthContext';
import { User, UserProfile } from '@/services/api/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Validation states
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);
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
    setAgeError(null);
    setGeneralError(null);
  }, [age]);
  
  useEffect(() => {
    setHeightError(null);
  }, [height]);
  
  useEffect(() => {
    setWeightError(null);
  }, [weight]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setInitialLoading(true);
        const user = await getCurrentUser();
        console.log('User data loaded:', user);
        
        // Set basic user data
        if (user.firstName) {
          setFirstName(user.firstName);
        }
        
        if (user.lastName) {
          setLastName(user.lastName);
        }
        
        // Set profile data if available
        console.log('User profile data:', user);
        
        // Gender
        if (user.gender) {
          console.log('Setting gender:', user.gender);
          setGender(user.gender);
        } else {
          console.log('No gender data available');
          setGender('');
        }
        
        // Height
        if (user.heightCm) {
          console.log('Setting height:', user.heightCm);
          setHeight(user.heightCm.toString());
        } else {
          console.log('No height data available');
          setHeight('');
        }
        
        // Weight
        if (user.weightKg) {
          console.log('Setting weight:', user.weightKg);
          setWeight(user.weightKg.toString());
        } else {
          console.log('No weight data available');
          setWeight('');
        }
        
        // Calculate age from dateOfBirth if available
        if (user.dateOfBirth) {
          const birthDate = new Date(user.dateOfBirth);
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          
          console.log('Setting age from dateOfBirth:', calculatedAge);
          setAge(calculatedAge.toString());
        } else {
          console.log('No dateOfBirth data available');
          setAge('');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setGeneralError('Failed to load your profile data. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

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
  
  const handleSave = async () => {
    // Reset all errors and success message
    setFirstNameError(null);
    setLastNameError(null);
    setAgeError(null);
    setHeightError(null);
    setWeightError(null);
    setGeneralError(null);
    setSuccessMessage(null);
    
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
    
    // Optional fields validation
    if (age && !validateNumeric(age, 'Age', setAgeError)) {
      isValid = false;
    }
    
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
      // Prepare user data for update with all fields
      const userData: Partial<User> = {
        firstName,
        lastName
      };
      
      // Add profile fields directly to the user object
      if (gender) {
        userData.gender = gender;
      }
      
      if (height) {
        userData.heightCm = parseInt(height);
      }
      
      if (weight) {
        userData.weightKg = parseInt(weight);
      }
      
      // Update user profile
      await updateCurrentUser(userData);
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      
      // Navigate back to account page after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      // Display specific error message
      if (error.message) {
        // Check for specific error types
        if (error.message.includes('first') || error.message.includes('firstName')) {
          setFirstNameError(error.message);
        } else if (error.message.includes('last') || error.message.includes('lastName')) {
          setLastNameError(error.message);
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

  const handleCancel = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ 
        title: 'Edit Profile',
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
          <Text style={styles.title}>Edit Your Profile</Text>
          <Text style={styles.subtitle}>Update your personal information</Text>
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
            
            {successMessage && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{successMessage}</Text>
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
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={[styles.input, ageError && styles.inputError]}
                  placeholder="Age"
                  placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
                {ageError && <Text style={styles.errorText}>{ageError}</Text>}
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

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Theme.COLORS.WHITE} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
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
  successContainer: {
    backgroundColor: 'rgba(0, 200, 0, 0.1)',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  successText: {
    color: 'green',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: Theme.COLORS.DEFAULT,
    fontSize: 16,
  },
});
