import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useAuthStore } from '../../store/useAuthStore';
import CircularGauge from '../../components/CircularGauge';
import ProgressBar from '../../components/ProgressBar';
import BottomNav from '../../components/BottomNav';
import SafeScreen from '../../components/SafeScreen';
import { DeviceIcon } from '../../components/DeviceCard';
import QuickBudgetModal from '../../components/QuickBudgetModal';

export default function Energy() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { devices, rooms, fetchDevices, fetchRooms, getTotalExpenses } = useDeviceStore();
  const [selectedRoomIdx, setSelectedRoomIdx] = useState(0);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);

  useEffect(() => { fetchDevices(); fetchRooms(); }, []);

  const totalExpenses = getTotalExpenses();
  const budgetLimit = user?.budget_limit || 500;
  const savings = Math.max(budgetLimit - totalExpenses, 0);
  
  // Safe room selection handling
  const selectedRoom = rooms[selectedRoomIdx] || rooms[0];
  const roomDevices = selectedRoom ? devices.filter(d => d.room_id === selectedRoom.id) : [];

  const handleNextRoom = () => {
    if (rooms.length > 0) {
      setSelectedRoomIdx((prev) => (prev + 1) % rooms.length);
    }
  };

  // Get current date string for gauge label
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SafeScreen>
      <View style={s.wrap}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M19 12H5M12 19l-7-7 7-7" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
            </TouchableOpacity>
            <Text style={s.title}>Energy Expenses</Text>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M12 5v.01M12 12v.01M12 19v.01" stroke="#2D3250" strokeWidth={3} strokeLinecap="round" /></Svg>
          </View>

          <View style={s.gaugeWrap}>
            <CircularGauge 
              value={totalExpenses} 
              maxValue={budgetLimit} 
              size={220} 
              strokeWidth={14} 
              sublabel="Expenses" 
              valuePrefix="$" 
              label={totalExpenses > budgetLimit ? "Over Budget" : "Good"} 
              color={totalExpenses > budgetLimit ? "#C55A5A" : "#2D3250"}
            />
            <View style={s.gLabels}>
              <Text style={s.gL}>$0</Text>
              <Text style={s.gL}>{todayStr}</Text>
              <Text style={s.gL}>${budgetLimit.toFixed(2)}</Text>
            </View>
          </View>

          <View style={s.savRow}>
            <View>
              <Text style={s.savL}>Savings</Text>
              <Text style={s.savV}>${savings.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={{alignItems:'flex-end'}} onPress={() => setIsBudgetModalVisible(true)}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Text style={s.savL}>Budget Limit</Text>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{marginBottom: 4}}>
                  <Path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={s.savV}>${budgetLimit.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
          <ProgressBar progress={totalExpenses/budgetLimit} color="#2D3250" height={8} />

          <View style={s.devH}>
            <Text style={s.devT}>Devices</Text>
            <TouchableOpacity style={s.dd} onPress={handleNextRoom}>
              <Text style={s.ddT}>{selectedRoom?.name || 'All Rooms'}</Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path d="M6 9l6 6 6-6" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </TouchableOpacity>
          </View>

          {roomDevices.map(d => (
            <View key={d.id} style={s.dRow}>
              <View style={s.dIcon}><DeviceIcon icon={d.icon} color="#2D3250" /></View>
              <View style={{flex:1}}>
                <Text style={s.dName}>{d.name}</Text>
                <Text style={s.dSub}>{d.device_count} Device{d.device_count !== 1 ? 's' : ''}</Text>
              </View>
              <View style={{alignItems:'flex-end'}}>
                <Text style={s.dSL}>Expense</Text>
                <Text style={s.dCost}>${d.monthly_cost.toFixed(2)}</Text>
              </View>
            </View>
          ))}
          {roomDevices.length === 0 && (
            <Text style={s.emptyState}>No devices in this room.</Text>
          )}
        </ScrollView>
        <BottomNav />
      </View>
      <QuickBudgetModal visible={isBudgetModalVisible} onClose={() => setIsBudgetModalVisible(false)} />
    </SafeScreen>
  );
}

const s = StyleSheet.create({
  wrap:{flex:1,backgroundColor:'#F5F5F7'},
  scroll:{paddingHorizontal:20,paddingTop:10,paddingBottom:20},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},
  title:{fontSize:17,fontWeight:'600',color:'#2D3250'},
  gaugeWrap:{alignItems:'center',marginBottom:16},
  gLabels:{flexDirection:'row',justifyContent:'space-between',width:'100%',paddingHorizontal:10,marginTop:8},
  gL:{fontSize:12,color:'#8E8E93'},
  savRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:12,marginTop:20},
  savL:{fontSize:12,color:'#8E8E93',marginBottom:4},
  savV:{fontSize:18,fontWeight:'700',color:'#2D3250'},
  devH:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:28,marginBottom:16},
  devT:{fontSize:18,fontWeight:'700',color:'#2D3250'},
  dd:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'#FFF',paddingHorizontal:12,paddingVertical:8,borderRadius:10,elevation:1},
  ddT:{fontSize:13,color:'#8E8E93'},
  dRow:{flexDirection:'row',alignItems:'center',backgroundColor:'#FFF',padding:16,borderRadius:14,marginBottom:10,elevation:1},
  dIcon:{width:44,height:44,borderRadius:13,backgroundColor:'#F0F0F5',justifyContent:'center',alignItems:'center',marginRight:14},
  dName:{fontSize:15,fontWeight:'600',color:'#2D3250'},
  dSub:{fontSize:12,color:'#8E8E93',marginTop:2},
  dSL:{fontSize:11,color:'#8E8E93',marginBottom:2},
  dCost:{fontSize:16,fontWeight:'700',color:'#2D3250'},
  emptyState: {textAlign: 'center', color: '#8E8E93', marginTop: 20, fontStyle: 'italic'},
});