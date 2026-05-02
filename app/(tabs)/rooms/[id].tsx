import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useDeviceStore } from '../../../store/useDeviceStore';
import CircularGauge from '../../../components/CircularGauge';
import BottomNav from '../../../components/BottomNav';
import SafeScreen from '../../../components/SafeScreen';
import DeviceCard from '../../../components/DeviceCard';
import DeviceModal from '../../../components/AddDeviceModal';
import DeviceControllerModal from '../../../components/DeviceControllerModal';

const { width } = Dimensions.get('window');

export default function RoomDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = parseInt(id || '1');
  const { devices, rooms, dailyBudgets, fetchDevices, fetchRooms, fetchDailyBudgets, toggleDevice, updateTemperature, utilityRate, fetchSettings } = useDeviceStore();

  const [mode, setMode] = useState<'money' | 'kwh'>('money');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isControllerVisible, setIsControllerVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      fetchDevices();
      fetchRooms();
      fetchDailyBudgets();
      fetchSettings();
      
      const interval = setInterval(() => {
        fetchDevices();
      }, 1000);
      
      return () => clearInterval(interval);
    }, [])
  );

  const room = rooms.find(r => r.id === roomId);
  const roomDevices = devices.filter(d => d.room_id === roomId);
  const budget = dailyBudgets.find(b => b.room_id === roomId);

  const currentRoomCost = roomDevices.reduce((sum, d) => sum + d.monthly_cost, 0);
  const currentRoomKwh = currentRoomCost / utilityRate;

  const handleTempAdjust = (change: number) => {
    if (room) {
      const newTemp = Math.max(16, Math.min(32, room.temperature + change));
      updateTemperature(room.id, newTemp);
    }
  };

  const handleEditDevice = (device: any) => {
    setSelectedDevice(device);
    setIsEditModalVisible(true);
  };

  const handleControlDevice = (device: any) => {
    setSelectedDevice(device);
    setIsControllerVisible(true);
  };

  return (
    <SafeScreen>
      <View style={s.wrap}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M19 12H5M12 19l-7-7 7-7" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
            </TouchableOpacity>
            <Text style={s.title}>{room?.name || 'Room'}</Text>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M12 5v.01M12 12v.01M12 19v.01" stroke="#2D3250" strokeWidth={3} strokeLinecap="round" /></Svg>
          </View>

          <View style={s.gaugeWrap}>
            <CircularGauge 
              value={room?.temperature || 28} 
              maxValue={40} 
              size={200} 
              strokeWidth={14} 
              valueSuffix="°C" 
              label="Room Temperature" 
              color="#C5A85F" 
              bgColor="#E8E8ED" 
            />
            
            <View style={s.tempControls}>
              <TouchableOpacity style={s.tempBtn} onPress={() => handleTempAdjust(-1)}>
                <Text style={s.tempBtnText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.tempBtn} onPress={() => handleTempAdjust(1)}>
                <Text style={s.tempBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.pcHeader}>
            <Text style={s.pcTitle}>Power Consumption</Text>
            <View style={s.toggle}>
              <TouchableOpacity 
                style={[s.toggleBtn, mode === 'money' && s.toggleActive]} 
                onPress={() => setMode('money')}
              >
                <Text style={[s.toggleText, mode === 'money' && s.toggleTextActive]}>Money</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.toggleBtn, mode === 'kwh' && s.toggleActive]} 
                onPress={() => setMode('kwh')}
              >
                <Text style={[s.toggleText, mode === 'kwh' && s.toggleTextActive]}>kWh</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.budgetRow}>
            <View style={s.budgetCard}>
              <Text style={s.budgetLabel}>Room Total</Text>
              <Text style={s.budgetValue}>
                {mode === 'money' ? `$${currentRoomCost.toFixed(2)}` : `${currentRoomKwh.toFixed(2)}`}
              </Text>
            </View>
            <View style={s.budgetCard}>
              <Text style={s.budgetLabel}>Monthly Budget</Text>
              <Text style={s.budgetValue}>
                {mode === 'money' ? `$${(budget?.budget || 120).toFixed(2)}` : `${((budget?.budget || 120) / (utilityRate || 0.12)).toFixed(1)}`}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={s.historyBtn} onPress={() => router.push('/details')}>
            <Text style={s.historyBtnText}>VIEW ANALYTICS</Text>
          </TouchableOpacity>

          <Text style={s.devTitle}>Devices In This Room ({roomDevices.length})</Text>
          <View style={s.devGrid}>
            {roomDevices.map(device => (
              <DeviceCard
                key={device.id}
                name={device.name}
                deviceCount={device.device_count}
                isOn={device.status === 1}
                icon={device.icon}
                onToggle={() => toggleDevice(device.id, device.status)}
                onPress={() => handleControlDevice(device)}
                onLongPress={() => handleEditDevice(device)}
                onEdit={() => handleEditDevice(device)}
              />
            ))}
          </View>
        </ScrollView>
        <BottomNav />
        
        <DeviceModal 
          visible={isEditModalVisible} 
          onClose={() => setIsEditModalVisible(false)} 
          initialDevice={selectedDevice}
        />

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
  wrap:{flex:1,backgroundColor:'#F5F5F7'},
  scroll:{paddingHorizontal:20,paddingTop:10,paddingBottom:20},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},
  title:{fontSize:17,fontWeight:'600',color:'#2D3250'},
  gaugeWrap:{alignItems:'center',marginBottom:24, position: 'relative'},
  tempControls: {flexDirection: 'row', gap: 20, marginTop: -20},
  tempBtn: {width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2},
  tempBtnText: {fontSize: 24, fontWeight: '600', color: '#2D3250'},
  pcHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16},
  pcTitle:{fontSize:18,fontWeight:'700',color:'#2D3250'},
  toggle:{flexDirection:'row',backgroundColor:'#E8E8ED',borderRadius:10,padding:3},
  toggleBtn: {paddingHorizontal:14,paddingVertical:6,borderRadius:8},
  toggleActive:{backgroundColor:'#FFF'},
  toggleText:{fontSize:12,color:'#8E8E93'},
  toggleTextActive:{fontWeight:'600',color:'#2D3250'},
  budgetRow:{flexDirection:'row',gap:12,marginBottom:18},
  budgetCard:{flex:1,backgroundColor:'#FFF',borderRadius:14,padding:16,alignItems:'center',elevation:1},
  budgetLabel:{fontSize:12,color:'#8E8E93',marginBottom:6},
  budgetValue:{fontSize:20,fontWeight:'700',color:'#2D3250'},
  historyBtn:{backgroundColor:'#2D3250',borderRadius:14,paddingVertical:14,alignItems:'center',marginBottom:24},
  historyBtnText:{color:'#FFF',fontSize:14,fontWeight:'700',letterSpacing:1},
  devTitle:{fontSize:16,fontWeight:'700',color:'#2D3250',marginBottom:16},
  devGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},
});
