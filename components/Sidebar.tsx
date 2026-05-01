import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

export default function Sidebar() {
  const router = useRouter();
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSidebarOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isSidebarOpen]);

  if (!isSidebarOpen && slideAnim._value === -SIDEBAR_WIDTH) {
    // Optimization to unmount when fully closed (if preferred), but we'll use pointerEvents
  }

  const navigate = (path: string) => {
    closeSidebar();
    setTimeout(() => {
      router.push(path as any);
    }, 200);
  };

  const handleLogout = () => {
    closeSidebar();
    setTimeout(() => {
      logout();
      router.replace('/welcome');
    }, 200);
  };

  return (
    <View style={styles.container} pointerEvents={isSidebarOpen ? 'auto' : 'none'}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={closeSidebar}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Sidebar Content */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="8" r="4" fill="#C5A85F" />
              <Path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="#C5A85F" />
            </Svg>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
        </View>

        <View style={styles.links}>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigate('/')}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Path d="M9 22V12h6v10" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
            <Text style={styles.linkText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigate('/energy')}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
            <Text style={styles.linkText}>Energy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => navigate('/profile')}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /><Circle cx="12" cy="7" r="4" stroke="#8E8E93" strokeWidth={2} /></Svg>
            <Text style={styles.linkText}>Profile & Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="#C55A5A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, // very high to sit over tabs
    elevation: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3250',
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  links: {
    paddingTop: 20,
    paddingHorizontal: 16,
    flex: 1,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3250',
    marginLeft: 16,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C55A5A',
    marginLeft: 16,
  },
});
