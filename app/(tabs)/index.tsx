import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useAuthStore } from '../../store/useAuthStore';
import DeviceCard from '../../components/DeviceCard';
import BottomNav from '../../components/BottomNav';
import SafeScreen from '../../components/SafeScreen';
import QuickBudgetModal from '../../components/QuickBudgetModal';
import { useUIStore } from '../../store/useUIStore';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { devices, rooms, fetchDevices, fetchRooms, toggleDevice, setSelectedRoom, getTotalExpenses } = useDeviceStore();
  const { toggleSidebar } = useUIStore();
  const [activeRoom, setActiveRoom] = useState(1);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);

  useEffect(() => {
    fetchDevices();
    fetchRooms();
  }, []);

  const roomDevices = devices.filter(d => d.room_id === activeRoom);
  const totalExpenses = getTotalExpenses();
  const budgetLimit = user?.budget_limit || 500;
  
  // Calculate width for slider based on expenses vs budget
  const expensePercentage = Math.min((totalExpenses / budgetLimit) * 100, 100);

  const handleRoomChange = (roomId: number) => {
    setActiveRoom(roomId);
    setSelectedRoom(roomId);
  };

  const handleSwipeLeft = () => {
    const currentIndex = rooms.findIndex(r => r.id === activeRoom);
    if (currentIndex < rooms.length - 1) {
      handleRoomChange(rooms[currentIndex + 1].id);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = rooms.findIndex(r => r.id === activeRoom);
    if (currentIndex > 0) {
      handleRoomChange(rooms[currentIndex - 1].id);
    }
  };

  return (
    <>
      <SafeScreen enableSwipe={false} onSwipeLeft={handleSwipeLeft} onSwipeRight={handleSwipeRight}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.menuBtn} onPress={toggleSidebar}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Line x1="3" y1="6" x2="15" y2="6" stroke="#2D3250" strokeWidth={2.5} strokeLinecap="round" />
                <Line x1="3" y1="12" x2="21" y2="12" stroke="#2D3250" strokeWidth={2.5} strokeLinecap="round" />
                <Line x1="3" y1="18" x2="18" y2="18" stroke="#2D3250" strokeWidth={2.5} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Home</Text>
            <TouchableOpacity style={styles.avatar} onPress={() => router.push('/profile')}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="8" r="4" fill="#C5A85F" />
                <Path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="#C5A85F" />
              </Svg>
            </TouchableOpacity>
          </View>

          {/* Welcome */}
          <Text style={styles.welcome}>Welcome {user?.name?.split(' ')[0] || 'User'}</Text>
          <Text style={styles.subtitle}>Smart Home Technology</Text>

          {/* Energy Card */}
          <TouchableOpacity style={styles.energyCard} onPress={() => router.push('/energy')} activeOpacity={0.8}>
            <View style={styles.energyCardInner}>
              <View style={styles.energyIconWrap}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#C5A85F" stroke="#C5A85F" strokeWidth={1} />
                </Svg>
              </View>
                <View style={styles.energyTextWrap}>
                  <Text style={styles.energyLabel}>Estimated Energy</Text>
                  <Text style={styles.energyLabel}>Expenses This Month</Text>
                </View>
                <TouchableOpacity 
                  onPress={(e) => { e.stopPropagation(); setIsBudgetModalVisible(true); }}
                  style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                >
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              </View>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: `${expensePercentage}%` }]} />
                  <View style={[styles.sliderThumb, { left: `${expensePercentage}%` }]} />
                </View>
                <View style={styles.sliderValueRow}>
                  <View style={styles.sliderValueBadge}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFF" strokeWidth={1} />
                    </Svg>
                    <Text style={styles.sliderValueText}>${totalExpenses > 0 ? totalExpenses.toFixed(2) : '0.00'} / ${budgetLimit}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Room Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomTabsScroll} contentContainerStyle={styles.roomTabsContainer}>
              {rooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={[styles.roomTab, activeRoom === room.id && styles.roomTabActive]}
                  onPress={() => handleRoomChange(room.id)}
                >
                  <Text style={[styles.roomTabText, activeRoom === room.id && styles.roomTabTextActive]}>
                    {room.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* View Room Link */}
            <TouchableOpacity style={styles.viewRoomLink} onPress={() => router.push(`/rooms/${activeRoom}` as any)}>
              <Text style={styles.viewRoomText}>View Room Details</Text>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke="#C5A85F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>

            {/* Devices Grid */}
            <View style={styles.devicesGrid}>
              {roomDevices.map((device) => (
                <DeviceCard
                  key={device.id}
                  name={device.name}
                  deviceCount={device.device_count}
                  isOn={device.status === 1}
                  icon={device.icon}
                  onToggle={() => toggleDevice(device.id, device.status)}
                />
              ))}
            </View>
          </ScrollView>
          <BottomNav />
        </View>
      </SafeScreen>
      <QuickBudgetModal visible={isBudgetModalVisible} onClose={() => setIsBudgetModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#2D3250' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8E8ED', justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 24, fontWeight: '700', color: '#2D3250', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#8E8E93', marginBottom: 20 },
  energyCard: { backgroundColor: '#2D3250', borderRadius: 18, padding: 18, marginBottom: 24 },
  energyCardInner: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  energyIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(197,168,95,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  energyTextWrap: { flex: 1 },
  energyLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  sliderContainer: { marginTop: 4 },
  sliderTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 4, position: 'relative' },
  sliderFill: { height: 8, backgroundColor: '#C5A85F', borderRadius: 4 },
  sliderThumb: { position: 'absolute', top: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFFFFF', marginLeft: -8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  sliderValueRow: { flexDirection: 'row', marginTop: 10 },
  sliderValueBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  sliderValueText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  roomTabsScroll: { marginBottom: 6 },
  roomTabsContainer: { gap: 6 },
  roomTab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  roomTabActive: { borderBottomWidth: 2, borderBottomColor: '#2D3250' },
  roomTabText: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
  roomTabTextActive: { color: '#2D3250', fontWeight: '600' },
  viewRoomLink: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginBottom: 14, gap: 4 },
  viewRoomText: { fontSize: 13, color: '#C5A85F', fontWeight: '600' },
  devicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});