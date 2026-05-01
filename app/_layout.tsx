import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { createTables } from '../db/schema';
import { View, Text, Platform, UIManager, LayoutAnimation } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useDeviceStore } from '../store/useDeviceStore';
import Sidebar from '../components/Sidebar';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Layout() {
  const [ready, setReady] = useState(false);
  const { isAuthenticated, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    try {
      createTables();
      checkAuth();
      setReady(true);
    } catch (e) {
      console.log('DB ERROR:', e);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, ready, segments]);

  useEffect(() => {
    if (isAuthenticated) {
      useDeviceStore.getState().startSimulationEngine();
    }
  }, [isAuthenticated]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      {isAuthenticated && <Sidebar />}
    </View>
  );
}