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
import { initialRegister } from '@/services/userService';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  // Clear errors when inputs change
  useEffect(() => {
    setEmailError(null);
    setGeneralError(null);
  }, [email]);
  
  useEffect(() => {
    setPasswordError(null);
    setGeneralError(null);
  }, [password]);
  
  useEffect(() => {
    setConfirmPasswordError(null);
  }, [confirmPassword]);
  
  useEffect(() => {
    setTermsError(null);
  }, [agreeToTerms]);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    if (!isValid) {
      setEmailError('Please enter a valid email address');
    }
    return isValid;
  };
  
  // Validate password strength
  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    // Check for at least one number
    if (!/\d/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    
    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setPasswordError('Password must contain at least one special character');
      return false;
    }
    
    return true;
  };
  
  const handleSignup = async () => {
    // Reset all errors
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    setTermsError(null);
    setGeneralError(null);
    
    // Validate all fields
    let isValid = true;
    
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      isValid = false;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!validatePassword(password)) {
      isValid = false;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    if (!agreeToTerms) {
      setTermsError('You must agree to the Terms of Service');
      isValid = false;
    }
    
    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      // Initial registration with email and password
      const userData = {
        email,
        password,
      };
      
      console.log('Submitting registration data:', userData);
      
      // This will store the tokens automatically
      await initialRegister(userData);
      
      // Navigate to profile setup (no need to pass userId as we're using JWT)
      router.push('/auth/profile-setup');
    } catch (error: any) {
      console.error('Registration error in component:', error);
      
      // Display specific error message
      if (error && error.message) {
        console.log('Error message in component:', error.message);
        
        // Check for specific error types
        if (typeof error.message === 'string') {
          // Try to parse the error message in case it's a stringified JSON
          let errorMessage = error.message;
          try {
            // Check if the message is a stringified JSON object
            if (error.message.startsWith('{') && error.message.endsWith('}')) {
              const parsedError = JSON.parse(error.message);
              // If it has a message property, use that
              if (parsedError.message && typeof parsedError.message === 'string') {
                errorMessage = parsedError.message;
              }
            }
          } catch (e) {
            // If parsing fails, use the original message
            console.log('Error parsing error message:', e);
          }
          
          // Now use the extracted error message
          if (errorMessage.toLowerCase().includes('email')) {
            console.log('Setting email error:', errorMessage);
            setEmailError(errorMessage);
          } else if (errorMessage.toLowerCase().includes('password')) {
            console.log('Setting password error:', errorMessage);
            setPasswordError(errorMessage);
          } else {
            console.log('Setting general error:', errorMessage);
            setGeneralError(errorMessage);
          }
        } else {
          // If error.message is not a string (e.g., it's an object)
          console.log('Error message is not a string:', typeof error.message);
          setGeneralError('Registration failed. Please try again.');
        }
      } else {
        console.log('No error message available');
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);

    // Simulate Google signup process
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to profile setup
      router.push('/auth/profile-setup');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ 
        title: 'Sign Up',
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
        <View style={styles.logoContainer}>
          <FontAwesome name="clock-o" size={80} color={Theme.COLORS.WHITE} />
          <Text style={styles.logoText}>OptiFit</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Account</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.inputContainer, emailError && styles.inputError]}>
              <FontAwesome name="envelope-o" size={20} color={Theme.COLORS.MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {emailError && <Text style={styles.errorText}>{emailError}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputContainer, passwordError && styles.inputError]}>
              <FontAwesome name="lock" size={20} color={Theme.COLORS.MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome 
                  name={showPassword ? "eye-slash" : "eye"} 
                  size={20} 
                  color={Theme.COLORS.MUTED} 
                />
              </TouchableOpacity>
            </View>
            {passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={[styles.inputContainer, confirmPasswordError && styles.inputError]}>
              <FontAwesome name="lock" size={20} color={Theme.COLORS.MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={Theme.COLORS.PLACEHOLDER}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
            {confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
          </View>

          <TouchableOpacity 
            style={styles.termsContainer}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            <View style={[styles.checkbox, termsError && styles.checkboxError]}>
              {agreeToTerms && (
                <FontAwesome name="check" size={14} color={Theme.COLORS.PRIMARY} />
              )}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {termsError && <Text style={styles.errorText}>{termsError}</Text>}
          
          {generalError && (
            <View style={styles.generalErrorContainer}>
              <Text style={styles.generalErrorText}>{generalError}</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.signupButton, !agreeToTerms && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={isLoading || !agreeToTerms}
          >
            {isLoading ? (
              <ActivityIndicator color={Theme.COLORS.WHITE} />
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleSignup}
            disabled={isLoading}
          >
            <FontAwesome name="google" size={20} color={Theme.COLORS.DEFAULT} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Sign up with Google</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
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
  checkboxError: {
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
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    marginTop: 10,
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
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  passwordToggle: {
    paddingHorizontal: 12,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Theme.COLORS.PRIMARY,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Theme.COLORS.MUTED,
  },
  termsLink: {
    color: Theme.COLORS.PRIMARY,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonDisabled: {
    backgroundColor: Theme.COLORS.MUTED,
  },
  signupButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    color: Theme.COLORS.MUTED,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: Theme.COLORS.WHITE,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: Theme.COLORS.DEFAULT,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: Theme.COLORS.MUTED,
    fontSize: 14,
  },
  loginLink: {
    color: Theme.COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
});
