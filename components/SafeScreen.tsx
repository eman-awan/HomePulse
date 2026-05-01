import React, { useRef } from 'react';
import { View, StyleSheet, Platform, StatusBar, PanResponder, Animated } from 'react-native';
import { usePathname, useRouter } from 'expo-router';

interface SafeScreenProps {
  children: React.ReactNode;
  backgroundColor?: string;
  enableSwipe?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const TAB_ROUTES = ['/', '/energy', '/details', '/profile'];

export default function SafeScreen({ 
  children, 
  backgroundColor = '#F5F5F7', 
  enableSwipe = true,
  onSwipeLeft,
  onSwipeRight
}: SafeScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Normalize pathname for index
  const currentRoute = pathname === '/index' ? '/' : pathname;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only claim the gesture if the user is swiping horizontally with intent
        // and not just tapping or slightly dragging vertically
        return enableSwipe && Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 2;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!enableSwipe) return;
        
        const currentIndex = TAB_ROUTES.indexOf(currentRoute);
        if (currentIndex === -1) return; // Not on a main tab
        
        if (gestureState.dx < -50) {
          // Swiped left
          if (onSwipeLeft) {
            onSwipeLeft();
          } else if (currentIndex < TAB_ROUTES.length - 1) {
            router.replace(TAB_ROUTES[currentIndex + 1] as any);
          }
        } else if (gestureState.dx > 50) {
          // Swiped right
          if (onSwipeRight) {
            onSwipeRight();
          } else if (currentIndex > 0) {
            router.replace(TAB_ROUTES[currentIndex - 1] as any);
          }
        }
      },
    })
  ).current;

  return (
    <View style={[styles.container, { backgroundColor }]} {...panResponder.panHandlers}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <View style={[styles.content, { backgroundColor }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 44,
  },
  content: {
    flex: 1,
  },
});
