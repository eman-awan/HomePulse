import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="energy" options={{ title: 'Energy' }} />
      <Tabs.Screen name="details" options={{ title: 'Details' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="rooms/[id]" options={{ title: 'Room', href: null }} />
    </Tabs>
  );
}