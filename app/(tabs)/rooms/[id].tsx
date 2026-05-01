import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDeviceStore } from '../../../store/useDeviceStore';
import CircularGauge from '../../../components/CircularGauge';
import BottomNav from '../../../components/BottomNav';
import SafeScreen from '../../../components/SafeScreen';
import { DeviceIcon } from '../../../components/DeviceCard';

export default function RoomDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = parseInt(id || '1');
  const { devices, rooms, dailyBudgets, fetchDevices, fetchRooms, fetchDailyBudgets, toggleDevice, updateTemperature } = useDeviceStore();

  const [mode, setMode] = useState<'money' | 'kwh'>('money');

  useEffect(() => { fetchDevices(); fetchRooms(); fetchDailyBudgets(); }, []);

  const room = rooms.find(r => r.id === roomId);
  const roomDevices = devices.filter(d => d.room_id === roomId);
  const budget = dailyBudgets.find(b => b.room_id === roomId);

  // Compute actual "Today's Cost" based on active devices (simplified logic)
  const activeDevices = roomDevices.filter(d => d.status === 1);
  const computedDailyCost = activeDevices.reduce((sum, d) => sum + ((d.energy_rate * d.device_count) / 30), 0) + (budget?.today_cost || 0);

  const kwhCost = computedDailyCost / 0.12; // arbitrary conversion
  const kwhBudget = (budget?.budget || 0) / 0.12;

  const handleTempAdjust = (change: number) => {
    if (room) {
      const newTemp = Math.max(16, Math.min(32, room.temperature + change));
      updateTemperature(room.id, newTemp);
    }
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
                <Text style={[s.toggleText, mode === 'kwh' && s.toggleTextActive]}>KWH</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.budgetRow}>
            <View style={s.budgetCard}>
              <Text style={s.budgetLabel}>Today</Text>
              <Text style={s.budgetValue}>
                {mode === 'money' ? `$${computedDailyCost.toFixed(2)}` : `${kwhCost.toFixed(1)}`}
              </Text>
            </View>
            <View style={s.budgetCard}>
              <Text style={s.budgetLabel}>Today's Budget</Text>
              <Text style={s.budgetValue}>
                {mode === 'money' ? `$${budget?.budget?.toFixed(2) || '4.03'}` : `${kwhBudget.toFixed(1)}`}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={s.historyBtn} onPress={() => router.push('/details')}>
            <Text style={s.historyBtnText}>HISTORY</Text>
          </TouchableOpacity>

          <Text style={s.devTitle}>Devices In This Room ({roomDevices.length})</Text>
          <View style={s.devGrid}>
            {roomDevices.map(d => (
              <TouchableOpacity key={d.id} style={s.devItem} onPress={() => toggleDevice(d.id, d.status)}>
                <View style={[s.devIcon, d.status === 1 && s.devIconOn]}>
                  <DeviceIcon icon={d.icon} color={d.status === 1 ? '#FFF' : '#2D3250'} />
                </View>
                <Text style={s.devName}>{d.name}</Text>
                <View style={[s.statusDot, d.status === 1 ? s.dotOn : s.dotOff]}>
                  <Text style={[s.statusText, d.status !== 1 && {color: '#8E8E93'}]}>{d.status === 1 ? 'ON' : 'Off'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <BottomNav />
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
  devGrid:{flexDirection:'row',flexWrap:'wrap',gap:16},
  devItem:{alignItems:'center',width:80},
  devIcon:{width:52,height:52,borderRadius:16,backgroundColor:'#F0F0F5',justifyContent:'center',alignItems:'center',marginBottom:8},
  devIconOn:{backgroundColor:'#2D3250'},
  devName:{fontSize:12,color:'#2D3250',fontWeight:'500',marginBottom:4,textAlign:'center'},
  statusDot:{borderRadius:10,paddingHorizontal:10,paddingVertical:3},
  dotOn:{backgroundColor:'#C5A85F'},
  dotOff:{backgroundColor:'#E8E8ED'},
  statusText:{fontSize:10,fontWeight:'600',color:'#FFF'},
});
