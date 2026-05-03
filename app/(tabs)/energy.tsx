import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useAuthStore } from '../../store/useAuthStore';
import SafeScreen from '../../components/SafeScreen';
import BottomNav from '../../components/BottomNav';

const { width, height } = Dimensions.get('window');

const SemicircleGauge = ({ value, max }: { value: number; max: number }) => {
  const radius = 100;
  const strokeWidth = 25;
  const normalizedValue = Math.min(value / max, 1);
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - normalizedValue * circumference;

  return (
    <View style={s.gaugeWrap}>
      <Svg width={radius * 2 + strokeWidth} height={radius + strokeWidth} viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius + strokeWidth}`}>
        <Path
          d={`M ${strokeWidth / 2} ${radius + strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${radius * 2 + strokeWidth / 2} ${radius + strokeWidth / 2}`}
          stroke="#F0F0F5"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M ${strokeWidth / 2} ${radius + strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${radius * 2 + strokeWidth / 2} ${radius + strokeWidth / 2}`}
          stroke="#2D3250"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <View style={s.gaugeTextWrap}>
        <Text style={s.gaugeLabel}>Expenses</Text>
        <Text style={s.gaugeValue}>${value.toFixed(2)}</Text>
        <Text style={s.gaugeStatus}>Good</Text>
      </View>
      <View style={s.gaugeBounds}>
        <Text style={s.boundText}>$0</Text>
        <Text style={s.boundText}>${max.toFixed(0)}</Text>
      </View>
    </View>
  );
};

export default function EnergyExpenses() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { devices, rooms, getTotalExpenses } = useDeviceStore();

  const [activeRoomId, setActiveRoomId] = useState(1);
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const budgetLimit = user?.budget_limit || 500;
  const dailyTotalBudget = budgetLimit / 30;
  
  // Calculate Today's Total Spend (Sum of all devices' today_cost)
  const totalTodaySpent = (devices || []).reduce((sum, d) => sum + (d.today_cost || 0), 0);
  const savings = dailyTotalBudget - totalTodaySpent;

  const roomDevices = devices.filter(d => d.room_id === activeRoomId);
  const activeRoomName = rooms.find(r => r.id === activeRoomId)?.name || 'Bedroom';
  const roomTodaySpent = roomDevices.reduce((sum, d) => sum + (d.today_cost || 0), 0);

  return (
    <SafeScreen>
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/')} style={s.backBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Energy Expenses</Text>
          <TouchableOpacity style={s.menuBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M12 5v.01M12 12v.01M12 19v.01" stroke="#2D3250" strokeWidth={3} strokeLinecap="round" />
            </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          <View style={s.topCard}>
            <SemicircleGauge value={totalTodaySpent} max={dailyTotalBudget} />
            <Text style={s.dateLabel}>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>

          <View style={s.savingsCard}>
            <View style={s.savingsTop}>
              <View>
                <Text style={s.savingsLabel}>Daily Savings</Text>
                <Text style={s.savingsValue}>${Math.max(0, savings).toFixed(2)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.savingsLabel}>Daily Target</Text>
                <Text style={s.savingsValue}>${dailyTotalBudget.toFixed(2)}</Text>
              </View>
            </View>
            <View style={s.savingsBarTrack}>
              <View style={[s.savingsBarFill, { width: `${Math.min(100, (totalTodaySpent / dailyTotalBudget) * 100)}%` }]} />
            </View>
          </View>

          <View style={s.listHeader}>
            <View>
              <Text style={s.sectionTitle}>Devices</Text>
              <Text style={s.roomTotalText}>Today: ${roomTodaySpent.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={s.dropdown} onPress={() => setDropdownVisible(true)}>
              <Text style={s.dropdownText}>{activeRoomName} ▾</Text>
            </TouchableOpacity>
          </View>

          <View style={s.deviceList}>
            {roomDevices.map(d => {
              const costToUse = d.today_cost || 0;
              const deviceKwh = costToUse / (useDeviceStore.getState().utilityRate || 0.12);
              const deviceDailyBudget = (budgetLimit / (devices.length || 1)) / 30;
              const progress = Math.min(100, (costToUse / deviceDailyBudget) * 100);

              return (
                <View key={d.id} style={s.deviceItem}>
                  <View style={s.deviceItemTop}>
                    <Text style={s.deviceName}>{d.name}</Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={s.devicePrice}>${costToUse.toFixed(2)}</Text>
                      <Text style={s.deviceKwh}>{deviceKwh.toFixed(2)} kWh</Text>
                    </View>
                  </View>
                  <View style={s.deviceBarTrack}>
                    <View style={[s.deviceBarFill, { width: `${progress}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>

        </ScrollView>
        <BottomNav />

        {/* Room Selection Dropdown (Modal style) */}
        <Modal visible={isDropdownVisible} transparent animationType="fade">
          <Pressable style={s.modalOverlay} onPress={() => setDropdownVisible(false)}>
            <View style={s.dropdownMenu}>
              <FlatList
                data={rooms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.dropdownItem}
                    onPress={() => {
                      setActiveRoomId(item.id);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={[s.dropdownItemText, activeRoomId === item.id && s.dropdownItemActive]}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Modal>
      </View>
    </SafeScreen>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2D3250' },
  backBtn: { padding: 5 },
  menuBtn: { padding: 5 },
  scroll: { paddingBottom: 100 },

  topCard: { backgroundColor: '#FFF', marginHorizontal: 25, borderRadius: 24, padding: 25, alignItems: 'center', elevation: 1 },
  gaugeWrap: { alignItems: 'center', position: 'relative', marginBottom: 20 },
  gaugeTextWrap: { position: 'absolute', bottom: 10, alignItems: 'center' },
  gaugeLabel: { fontSize: 12, color: '#A0A0A0', marginBottom: 4 },
  gaugeValue: { fontSize: 32, fontWeight: '800', color: '#2D3250' },
  gaugeStatus: { fontSize: 14, color: '#4CD964', fontWeight: '600', marginTop: 4 },
  gaugeBounds: { flexDirection: 'row', justifyContent: 'space-between', width: width - 100, marginTop: 10 },
  boundText: { fontSize: 11, color: '#A0A0A0' },
  dateLabel: { fontSize: 12, color: '#A0A0A0', marginTop: 10 },

  savingsCard: { backgroundColor: '#FFF', marginHorizontal: 25, borderRadius: 24, padding: 25, marginTop: 20, elevation: 1 },
  savingsTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  savingsLabel: { fontSize: 11, color: '#A0A0A0', marginBottom: 4 },
  savingsValue: { fontSize: 16, fontWeight: '700', color: '#2D3250' },
  savingsBarTrack: { height: 8, backgroundColor: '#F0F0F5', borderRadius: 4, overflow: 'hidden' },
  savingsBarFill: { height: '100%', backgroundColor: '#2D3250', borderRadius: 4 },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginTop: 30, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3250' },
  roomTotalText: { fontSize: 12, color: '#D4A056', fontWeight: '600', marginTop: 2 },
  dropdown: { backgroundColor: '#F0F0F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  dropdownText: { fontSize: 12, color: '#A0A0A0', fontWeight: '600' },

  deviceList: { paddingHorizontal: 25 },
  deviceItem: { marginBottom: 20 },
  deviceItemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  deviceName: { fontSize: 14, fontWeight: '600', color: '#2D3250' },
  devicePrice: { fontSize: 14, fontWeight: '700', color: '#2D3250' },
  deviceKwh: { fontSize: 11, color: '#A0A0A0', marginTop: 1 },
  deviceBarTrack: { height: 6, backgroundColor: '#F0F0F5', borderRadius: 3, overflow: 'hidden' },
  deviceBarFill: { height: '100%', backgroundColor: '#D4A056', borderRadius: 3 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  dropdownMenu: { backgroundColor: '#FFF', width: '70%', borderRadius: 20, padding: 10, elevation: 10 },
  dropdownItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  dropdownItemText: { fontSize: 15, color: '#2D3250', fontWeight: '600' },
  dropdownItemActive: { color: '#C5A85F' }
});