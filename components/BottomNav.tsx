import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Platform, Animated } from 'react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { usePathname, useRouter } from 'expo-router';

const tabs = [
  {
    name: 'Home',
    route: '/',
    icon: (color: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={2} />
        <Rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth={2} />
        <Rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={2} />
        <Rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth={2} />
      </Svg>
    ),
  },
  {
    name: 'Energy',
    route: '/energy',
    icon: (color: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    name: 'Details',
    route: '/details',
    icon: (color: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Line x1="6" y1="20" x2="6" y2="10" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <Line x1="12" y1="20" x2="12" y2="4" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        <Line x1="18" y1="20" x2="18" y2="14" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      </Svg>
    ),
  },
  {
    name: 'Profile',
    route: '/profile',
    icon: (color: string) => (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={2} />
      </Svg>
    ),
  },
];

const TabIcon = ({ tab, isActive, onPress }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const color = isActive ? '#2D3250' : '#8E8E93';

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.8, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, tension: 150, useNativeDriver: true }).start();
    onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tab}
    >
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
        {tab.icon(color)}
        {isActive && <View style={styles.activeDot} />}
      </Animated.View>
    </Pressable>
  );
};

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route || (tab.route === '/' && pathname === '/index');
        
        return (
          <TabIcon 
            key={tab.name} 
            tab={tab} 
            isActive={isActive} 
            onPress={() => router.push(tab.route as any)} 
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'android' ? 28 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2D3250',
    marginTop: 6,
  },
});
