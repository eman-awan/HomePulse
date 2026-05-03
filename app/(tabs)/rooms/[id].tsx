import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useDeviceStore } from '../../../store/useDeviceStore';
import CircularGauge from '../../../components/CircularGauge';
import BottomNav from '../../../components/BottomNav';
import SafeScreen from '../../../components/SafeScreen';
import DeviceCard from '../../../components/DeviceCard';
import DeviceControllerModal from '../../../components/DeviceControllerModal';

const { width } = Dimensions.get('window');

const TodayIcon = () => (
  <View style={s.miniIconWrap}>
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

const BudgetIcon = () => (
  <View style={s.miniIconWrap}>
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#2D3250" />
    </Svg>
  </View>
);

import { useAuthStore } from '../../../store/useAuthStore';

// ... (existing code)

export default function RoomDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = parseInt(id || '1');
  const { user } = useAuthStore();
  const { devices, rooms, dailyBudgets, fetchDevices, fetchRooms, fetchDailyBudgets, toggleDevice, updateTemperature, utilityRate, startSimulationEngine } = useDeviceStore();

  const [isControllerVisible, setIsControllerVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      fetchDevices();
      fetchRooms();
      fetchDailyBudgets();
      startSimulationEngine();
    }, [])
  );

  const room = rooms.find(r => r.id === roomId);
  const roomDevices = devices.filter(d => d.room_id === roomId);

  // REALISTIC ROOM BUDGET LOGIC:
  const totalMonthlyBudget = user?.budget_limit || 500;
  const numRooms = (rooms || []).length || 1;
  const roomDailyBudget = (totalMonthlyBudget / numRooms) / 30;
  const roomTodaySpent = roomDevices.reduce((sum, d) => sum + (d.today_cost || 0), 0);
  const isExceeding = roomTodaySpent > roomDailyBudget;

  const handleControlDevice = (device: any) => {
    setSelectedDevice(device);
    setIsControllerVisible(true);
  };

  return (
    <SafeScreen>
      <View style={s.container}>
        {/* Header (Image 03 style) */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/')} style={s.backBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#2D3250" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{room?.name || 'Living Room'}</Text>
          <TouchableOpacity style={s.menuBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M12 5v.01M12 12v.01M12 19v.01" stroke="#2D3250" strokeWidth={3} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {isExceeding && (
            <View style={s.reminderBanner}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={{ marginRight: 12 }}>
                <Path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View style={{ flex: 1 }}>
                <Text style={s.reminderTitle}>Energy Limit Reached</Text>
                <Text style={s.reminderText}>Today's room budget (${roomDailyBudget.toFixed(2)}) exceeded. Consider switching off devices.</Text>
              </View>
            </View>
          )}

          {/* Minimalist Circular Gauge (Image 03) */}
          <View style={s.gaugeWrap}>
            <TouchableOpacity
              style={s.tempControlBtn}
              onPress={() => updateTemperature(roomId, (room?.temperature || 28) - 1)}
            >
              <Text style={s.tempControlText}>-</Text>
            </TouchableOpacity>

            <View style={s.gaugeOuterCircle}>
              <View style={s.gaugeInner}>
                <Text style={s.tempValue}>{room?.temperature || 28}°C</Text>
                <Text style={s.tempLabel}>Room Temperatre</Text>
              </View>
              <CircularGauge
                value={room?.temperature || 28}
                maxValue={40}
                size={width * 0.55}
                strokeWidth={2}
                color="#2D3250"
                bgColor="#E8E8ED"
              />
            </View>

            <TouchableOpacity
              style={s.tempControlBtn}
              onPress={() => updateTemperature(roomId, (room?.temperature || 28) + 1)}
            >
              <Text style={s.tempControlText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Consumption Controls Header */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Power Consumption</Text>
            <TouchableOpacity style={s.modePicker}>
              <Text style={s.modeText}>Money ▾</Text>
            </TouchableOpacity>
          </View>

          {/* Side-by-Side Mini Cards */}
          <View style={s.miniCardsRow}>
            <View style={s.miniCard}>
              <TodayIcon />
              <View>
                <Text style={s.miniLabel}>Today</Text>
                <Text style={s.miniValue}>${roomTodaySpent.toFixed(2)}</Text>
              </View>
            </View>
            <View style={s.miniCard}>
              <BudgetIcon />
              <View>
                <Text style={s.miniLabel}>Today's Budget</Text>
                <Text style={s.miniValue}>${roomDailyBudget.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Full-width History Button */}
          <TouchableOpacity style={s.historyBtn} onPress={() => router.push('/details')}>
            <Text style={s.historyBtnText}>HISTORY</Text>
          </TouchableOpacity>

          {/* Room Devices Grid */}
          <Text style={s.sectionTitle}>Devices In This Room ({roomDevices.length})</Text>
          <View style={s.devicesGrid}>
            {roomDevices.map((device) => (
              <DeviceCard
                key={device.id}
                name={device.name}
                deviceCount={device.device_count}
                isOn={device.status === 1}
                icon={device.icon}
                onToggle={() => toggleDevice(device.id, device.status)}
                onPress={() => handleControlDevice(device)}
                variant="room"
              />
            ))}
          </View>

        </ScrollView>
        <BottomNav />
        <DeviceControllerModal
          visible={isControllerVisible}
          onClose={() => setIsControllerVisible(false)}
          device={selectedDevice}
        />
      </View>
    </SafeScreen>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    backgroundColor: '#FFF'
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#2D3250' },
  backBtn: { padding: 5 },
  menuBtn: { padding: 5 },

  scroll: { paddingBottom: 100 },

  reminderBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D4A056', marginHorizontal: 25, marginTop: 10, padding: 16, borderRadius: 20, elevation: 4, marginBottom: 10 },
  reminderTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', marginBottom: 2 },
  reminderText: { fontSize: 12, color: 'rgba(255,255,255,0.9)', lineHeight: 16 },

  gaugeWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 35, gap: 15 },
  tempControlBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  tempControlText: { fontSize: 24, fontWeight: '600', color: '#2D3250' },

  gaugeOuterCircle: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15
  },
  gaugeInner: { position: 'absolute', alignItems: 'center', paddingTop: 10 },
  tempValue: { fontSize: 52, fontWeight: '800', color: '#2D3250', lineHeight: 60 },
  tempLabel: { fontSize: 13, color: '#A0A0A0', marginTop: 0 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3250', paddingHorizontal: 25, marginBottom: 15 },
  modePicker: { backgroundColor: '#F5F5F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  modeText: { fontSize: 12, color: '#A0A0A0', fontWeight: '600' },

  miniCardsRow: { flexDirection: 'row', gap: 15, paddingHorizontal: 25, marginBottom: 20 },
  miniCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10
  },
  miniIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F0F5', justifyContent: 'center', alignItems: 'center' },
  miniLabel: { fontSize: 11, color: '#A0A0A0', marginBottom: 2 },
  miniValue: { fontSize: 16, fontWeight: '800', color: '#2D3250' },

  historyBtn: { backgroundColor: '#2D3250', marginHorizontal: 25, paddingVertical: 18, borderRadius: 24, alignItems: 'center', marginBottom: 35, elevation: 4 },
  historyBtnText: { color: '#FFF', fontWeight: '800', letterSpacing: 2, fontSize: 13 },

  devicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 25 }
});
