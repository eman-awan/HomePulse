import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, LayoutAnimation } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useDeviceStore } from '../../store/useDeviceStore';
import ProgressBar from '../../components/ProgressBar';
import { DeviceIcon } from '../../components/DeviceCard';
import BottomNav from '../../components/BottomNav';
import SafeScreen from '../../components/SafeScreen';
import AddDeviceModal from '../../components/AddDeviceModal';

const COLORS = ['#C5A85F', '#2D3250', '#6B8E9B', '#C55A5A', '#7B6B8D'];

export default function Expenses() {
  const router = useRouter();
  const { devices, fetchDevices, removeDevice } = useDeviceStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => { fetchDevices(); }, []);

  const deviceMap = new Map<string, { id: number, name: string; icon: string; count: number; cost: number }>();
  
  devices.forEach(d => {
    // Grouping by type for display, but keeping the first id to allow deletion of a whole group or specific item if needed
    // Simplified: Delete will just delete the first device of this type found
    const key = d.type;
    if (deviceMap.has(key)) {
      const existing = deviceMap.get(key)!;
      existing.count += d.device_count;
      existing.cost += d.monthly_cost;
    } else {
      deviceMap.set(key, { id: d.id, name: d.name, icon: d.icon, count: d.device_count, cost: d.monthly_cost });
    }
  });
  
  const uniqueDevices = Array.from(deviceMap.values());
  const maxCost = Math.max(...uniqueDevices.map(d => d.cost), 1);

  const confirmDelete = (type: string, name: string) => {
    Alert.alert(
      "Remove Device",
      `Are you sure you want to remove all ${name} devices?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
             LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
             // Find all devices of this type and remove them
             const devicesToRemove = devices.filter(d => d.type === type);
             devicesToRemove.forEach(d => removeDevice(d.id));
          }
        }
      ]
    );
  };

  return (
    <SafeScreen>
      <View style={s.wrap}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M19 12H5M12 19l-7-7 7-7" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
            </TouchableOpacity>
            <Text style={s.title}>Expenses</Text>
            <View style={{width:22}} />
          </View>

          {uniqueDevices.map((d, i) => (
            <TouchableOpacity 
              key={d.name + i} 
              style={s.row}
              onLongPress={() => confirmDelete(d.icon, d.name)}
              delayLongPress={500}
            >
              <View style={s.rowTop}>
                <View style={s.iconWrap}>
                  <DeviceIcon icon={d.icon} color="#2D3250" />
                </View>
                <View style={s.info}>
                  <Text style={s.dName}>{d.name}</Text>
                  <Text style={s.dSub}>{d.count} Device{d.count !== 1 ? 's' : ''} · (${d.cost.toFixed(2)})</Text>
                </View>
              </View>
              <ProgressBar progress={d.cost / maxCost} color={COLORS[i % COLORS.length]} bgColor="#F0F0F5" height={6} />
            </TouchableOpacity>
          ))}
          
          {uniqueDevices.length === 0 && (
            <Text style={{textAlign: 'center', color: '#8E8E93', marginTop: 20}}>No devices found. Add one below!</Text>
          )}

          <TouchableOpacity style={s.addBtn} onPress={() => setIsModalVisible(true)}>
            <Text style={s.addBtnText}>ADD NEW DEVICE</Text>
          </TouchableOpacity>
        </ScrollView>
        <BottomNav />
      </View>

      <AddDeviceModal 
        visible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
      />
    </SafeScreen>
  );
}

const s = StyleSheet.create({
  wrap:{flex:1,backgroundColor:'#F5F5F7'},
  scroll:{paddingHorizontal:20,paddingTop:10,paddingBottom:20},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},
  title:{fontSize:17,fontWeight:'600',color:'#2D3250'},
  row:{backgroundColor:'#FFF',borderRadius:14,padding:16,marginBottom:12,elevation:1,shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:4},
  rowTop:{flexDirection:'row',alignItems:'center',marginBottom:12},
  iconWrap:{width:44,height:44,borderRadius:13,backgroundColor:'#F0F0F5',justifyContent:'center',alignItems:'center',marginRight:14},
  info:{flex:1},
  dName:{fontSize:15,fontWeight:'600',color:'#2D3250'},
  dSub:{fontSize:12,color:'#8E8E93',marginTop:2},
  addBtn:{backgroundColor:'#2D3250',borderRadius:14,paddingVertical:16,alignItems:'center',marginTop:12},
  addBtnText:{color:'#FFF',fontSize:14,fontWeight:'700',letterSpacing:1},
});