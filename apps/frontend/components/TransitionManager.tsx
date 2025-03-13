import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AppLoadingScreen from './AppLoadingScreen';

interface TransitionManagerProps {
  children: ReactNode;
  minTransitionDuration?: number;
  maxTransitionDuration?: number;
  showLoadingScreen?: boolean;
}

/**
 * TransitionManager handles smooth transitions between routes
 * and prevents flashing of error screens during navigation.
 */
const TransitionManager: React.FC<TransitionManagerProps> = ({
  children,
  minTransitionDuration = 300,
  maxTransitionDuration = 1000,
  showLoadingScreen = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentChildren, setCurrentChildren] = useState(children);
  const [nextChildren, setNextChildren] = useState<ReactNode | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const lastPathRef = useRef(pathname);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigationStartTimeRef = useRef<number>(0);

  // Listen for route changes
  useEffect(() => {
    // Skip initial render
    if (lastPathRef.current === pathname) {
      return;
    }

    // Start transition
    navigationStartTimeRef.current = Date.now();
    setIsTransitioning(true);
    
    // Fade out current view
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Update children references
      setNextChildren(children);
      
      // Calculate how long to show the loading screen
      const elapsedTime = Date.now() - navigationStartTimeRef.current;
      const remainingTime = Math.max(minTransitionDuration - elapsedTime, 0);
      
      // Set a minimum transition time to prevent flashing
      transitionTimerRef.current = setTimeout(() => {
        // Swap in the new children
        setCurrentChildren(nextChildren);
        setNextChildren(null);
        
        // Fade in the new view
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          setIsTransitioning(false);
        });
      }, remainingTime);
    });

    // Set a maximum transition time to prevent hanging
    const maxTransitionTimer = setTimeout(() => {
      if (isTransitioning) {
        console.log('Forcing transition completion after timeout');
        setCurrentChildren(children);
        setNextChildren(null);
        setIsTransitioning(false);
        fadeAnim.setValue(1);
      }
    }, maxTransitionDuration);

    // Update last path
    lastPathRef.current = pathname;

    // Clean up timers
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      clearTimeout(maxTransitionTimer);
    };
  }, [children, pathname, fadeAnim, minTransitionDuration, maxTransitionDuration]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  // If we're transitioning and should show loading screen, render it
  if (isTransitioning && showLoadingScreen) {
    return <AppLoadingScreen />;
  }

  // Otherwise, render the current children with fade animation
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {currentChildren}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default TransitionManager;
