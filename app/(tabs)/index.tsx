import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '../../store/useAuthStore';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useUIStore } from '../../store/useUIStore';
import SafeScreen from '../../components/SafeScreen';
import DeviceCard from '../../components/DeviceCard';
import DeviceControllerModal from '../../components/DeviceControllerModal';
import BottomNav from '../../components/BottomNav';

const { width } = Dimensions.get('window');

const MenuIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M4 6h16M4 12h16m-7 6h7" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const EnergyIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFF" strokeWidth={1} />
  </Svg>
);

export default function Home() {
  const router = useRouter();
  const { user, updateBudget } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { 
    devices, rooms, fetchDevices, fetchRooms, 
    getProjectedBill, getTotalExpenses, getForecast,
    startSimulationEngine, toggleDevice 
  } = useDeviceStore();

  const [activeRoom, setActiveRoom] = useState(1);
  const [isControllerVisible, setIsControllerVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    fetchDevices();
    fetchRooms();
    startSimulationEngine();
  }, []);

  const handleOpenBudget = () => {
    setBudgetInput((user?.budget_limit || 500).toString());
    setIsBudgetModalVisible(true);
  };

  const handleSaveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      updateBudget(val);
      setIsBudgetModalVisible(false);
    }
  };

  const totalExpense = getTotalExpenses();
  const totalTodaySpent = (devices || []).reduce((sum, d) => sum + (d.today_cost || 0), 0);
  const projectedBill = getProjectedBill();
  const forecast = getForecast();
  const budgetLimit = user?.budget_limit || 500;
  const dailyTotalBudget = budgetLimit / 30;

  const roomDevices = (devices || []).filter(d => d.room_id === activeRoom);

  const handleControlDevice = (device: any) => {
    setSelectedDevice(device);
    setIsControllerVisible(true);
  };

  return (
    <SafeScreen>
      <View style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={toggleSidebar}>
            <MenuIcon />
          </TouchableOpacity>
          <Text style={s.title}>HomePulse</Text>
          <TouchableOpacity style={s.avatar}>
            <Text style={s.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          
          <View style={s.welcomeWrap}>
            <Text style={s.welcomeText}>Welcome {user?.name || 'Dianne'}</Text>
            <Text style={s.subWelcome}>Smart Home Technology</Text>
          </View>

          <View style={s.energyCard}>
            <View style={s.energyCardInner}>
              <View style={s.energyIconWrap}>
                <EnergyIcon />
              </View>
              <View style={s.energyTextWrap}>
                <Text style={s.energyLabel}>Current Usage (Today): ${totalTodaySpent.toFixed(2)}</Text>
                <Text style={s.energyValue}>${(projectedBill || 0).toFixed(2)}</Text>
                <Text style={s.forecastText}>Projected Total ({forecast?.trend || 'Stable'})</Text>
              </View>
            </View>
            <View style={s.sliderContainer}>
              <View style={s.sliderTrack}>
                <View style={[s.sliderFill, { width: `${Math.min(100, (totalTodaySpent / dailyTotalBudget) * 100)}%` }]} />
              </View>
              <View style={s.sliderValueRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.monthlyStatText}>Monthly: ${(projectedBill || 0).toFixed(0)} / ${budgetLimit}</Text>
                  <Text style={s.dailyStatText}>Today: ${totalTodaySpent.toFixed(2)} / ${dailyTotalBudget.toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={s.setBudgetBtn} onPress={handleOpenBudget}>
                   <Text style={s.setBudgetText}>SET</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.roomTabsScroll} contentContainerStyle={s.roomTabsContainer}>
            {(rooms || []).map((room) => {
              const roomCost = devices.filter(d => d.room_id === room.id).reduce((sum, d) => sum + (d.monthly_cost || 0), 0);
              return (
                <TouchableOpacity
                  key={room.id}
                  style={[s.roomTab, activeRoom === room.id && s.roomTabActive]}
                  onPress={() => setActiveRoom(room.id)}
                >
                  <Text style={[s.roomTabText, activeRoom === room.id && s.roomTabTextActive]}>
                    {room.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={s.viewRoomLink} onPress={() => router.push(`/rooms/${activeRoom}` as any)}>
            <View>
              <Text style={s.viewRoomText}>View Room Statistics</Text>
              <Text style={s.viewRoomSub}>Temp, Budget & Real-time Usage</Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18l6-6-6-6" stroke="#C5A85F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <View style={s.controlsHeader}>
            <Text style={s.sectionTitle}>Devices</Text>
            <View style={s.dot} />
          </View>
          
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
              />
            ))}
          </View>

        </ScrollView>
        <BottomNav />
        
        <Modal visible={isBudgetModalVisible} transparent animationType="fade">
          <Pressable style={s.modalOverlay} onPress={() => setIsBudgetModalVisible(false)}>
            <Pressable style={s.budgetModalContent}>
              <Text style={s.budgetModalTitle}>Set Monthly Budget</Text>
              <Text style={s.budgetModalSub}>Enter your target spending limit for this month.</Text>
              
              <View style={s.inputContainer}>
                <Text style={s.currencySymbol}>$</Text>
                <TextInput 
                  style={s.budgetInput}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="numeric"
                  placeholder="500"
                  autoFocus
                />
              </View>

              <View style={s.budgetActionRow}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setIsBudgetModalVisible(false)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={handleSaveBudget}>
                  <Text style={s.saveBtnText}>Save Limit</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

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
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  title: { fontSize: 20, fontWeight: '700', color: '#2D3250' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8E8ED', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#2D3250' },
  scroll: { paddingBottom: 100 },
  
  welcomeWrap: { paddingHorizontal: 20, marginTop: 10, marginBottom: 20 },
  welcomeText: { fontSize: 28, fontWeight: '800', color: '#2D3250' },
  subWelcome: { fontSize: 13, color: '#A0A0A0', marginTop: 4 },

  energyCard: { backgroundColor: '#2D3250', borderRadius: 28, padding: 24, marginHorizontal: 20, marginBottom: 25, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20 },
  energyCardInner: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  energyIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  energyTextWrap: { flex: 1 },
  energyLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  energyValue: { fontSize: 28, fontWeight: '800', color: '#FFF' },
  forecastText: { fontSize: 12, color: '#C5A85F', marginTop: 4 },
  sliderContainer: { marginTop: 10 },
  sliderTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  sliderFill: { height: '100%', backgroundColor: '#C5A85F', borderRadius: 4 },
  sliderValueRow: { marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  
  monthlyStatText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  dailyStatText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600' },

  setBudgetBtn: { backgroundColor: '#C5A85F', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  setBudgetText: { color: '#2D3250', fontSize: 12, fontWeight: '800' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  budgetModalContent: { backgroundColor: '#FFF', borderRadius: 28, padding: 30, width: '100%', maxWidth: 400 },
  budgetModalTitle: { fontSize: 22, fontWeight: '800', color: '#2D3250', marginBottom: 10 },
  budgetModalSub: { fontSize: 14, color: '#A0A0A0', lineHeight: 20, marginBottom: 25 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 15, marginBottom: 25 },
  currencySymbol: { fontSize: 20, fontWeight: '700', color: '#2D3250', marginRight: 10 },
  budgetInput: { flex: 1, fontSize: 24, fontWeight: '800', color: '#2D3250' },
  budgetActionRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 16, backgroundColor: '#F5F5F7' },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: '#A0A0A0' },
  saveBtn: { flex: 2, paddingVertical: 16, alignItems: 'center', borderRadius: 16, backgroundColor: '#2D3250' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },

  roomTabsScroll: { marginBottom: 25 },
  roomTabsContainer: { paddingHorizontal: 20, gap: 12 },
  roomTab: { backgroundColor: '#FFF', paddingHorizontal: 22, paddingVertical: 14, borderRadius: 20, alignItems: 'center', minWidth: 110, elevation: 2 },
  roomTabActive: { backgroundColor: '#C5A85F' },
  roomTabText: { fontSize: 15, fontWeight: '600', color: '#8E8E93' },
  roomTabTextActive: { color: '#FFF' },
  roomCostText: { fontSize: 11, color: '#C5A85F', marginTop: 4 },
  roomCostTextActive: { color: 'rgba(255,255,255,0.8)' },
  viewRoomLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderRadius: 22, marginHorizontal: 20, marginBottom: 25, elevation: 1 },
  viewRoomText: { fontSize: 15, fontWeight: '700', color: '#2D3250' },
  viewRoomSub: { fontSize: 11, color: '#A0A0A0', marginTop: 2 },
  controlsHeader: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3250', marginRight: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C5A85F' },
  devicesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 }
});