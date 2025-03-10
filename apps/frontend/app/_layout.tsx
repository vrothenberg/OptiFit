import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Stack configuration with screens
  const StackNavigator = () => (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen 
        name="onboarding" 
        options={{ 
          headerShown: true,
          title: 'Onboarding',
          headerStyle: {
            backgroundColor: '#5E72E4',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {Platform.OS === 'web' ? (
        <View style={{
          flex: 1,
          alignItems: 'center',
          backgroundColor: '#f5f5f5', // Light background for the "margins"
          width: '100%', // Full width for scrolling
          height: '100%',
          overflow: 'scroll', // Enable scrolling on the entire view
        }}>
          <View style={{
            width: '100%',
            maxWidth: 768, // Increased from 480px for better use of screen space
            minHeight: '100%',
            // Use boxShadow for web instead of shadowProps
            // @ts-ignore - Web-only property
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          }}>
            <StackNavigator />
          </View>
        </View>
      ) : (
        <StackNavigator />
      )}
    </ThemeProvider>
  );
}
