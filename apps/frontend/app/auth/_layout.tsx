import { Stack } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Platform } from 'react-native';
import Theme from '@/constants/Theme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: Theme.COLORS.PRIMARY,
        },
        headerTintColor: '#fff',
        // Ensure iOS back button works properly
        ...Platform.select({
          ios: {
            headerBackVisible: true,
            headerLeft: undefined, // This ensures the default back button is used
          },
        }),
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Login',
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          title: 'Sign Up',
        }} 
      />
      <Stack.Screen 
        name="profile-setup" 
        options={{ 
          title: 'Profile Setup',
        }} 
      />
    </Stack>
  );
}
