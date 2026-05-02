import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDeviceStore } from '../../store/useDeviceStore';
import BarChart from '../../components/BarChart';
import ExpenseRow from '../../components/ExpenseRow';
import BottomNav from '../../components/BottomNav';
import SafeScreen from '../../components/SafeScreen';
import ExpensesSheet from '../../components/ExpensesSheet';

const { width } = Dimensions.get('window');

export default function Details() {
  const router = useRouter();
  const { monthlyExpenses, fetchMonthlyExpenses, rooms, devices, fetchRooms, fetchDevices } = useDeviceStore();
  const [viewMode, setViewMode] = useState<'monthly'|'yearly'>('monthly');
  const [activeBar, setActiveBar] = useState(0);
  const [isExpensesSheetVisible, setExpensesSheetVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMonthlyExpenses(); 
      fetchRooms();
      fetchDevices();
      
      const interval = setInterval(() => {
        fetchDevices();
      }, 1000);
      
      return () => clearInterval(interval);
    }, [])
  );

  // Filter and sort for the chart based on viewMode. 
  // Simplified for demo: Just showing the most recent 6 items for monthly.
  const displayExpenses = monthlyExpenses.slice(0, 6).reverse();

  const chartData = displayExpenses.map(e => ({
    label: e.month.substring(0, 3),
    value: e.cost / 1000,
  }));

  const activeExpense = displayExpenses[activeBar];

  // Room Breakdown logic
  const roomBreakdown = rooms.map(room => {
    const roomDevs = devices.filter(d => d.room_id === room.id);
    const cost = roomDevs.reduce((sum, d) => sum + d.monthly_cost, 0);
    return { name: room.name, cost, icon: room.icon };
  }).sort((a, b) => b.cost - a.cost);

  const totalCurrentCost = roomBreakdown.reduce((sum, r) => sum + r.cost, 0);

  // More realistic daily average calculation
  const todayCost = activeExpense ? activeExpense.cost / 30 : 0;
  const todayKwh = activeExpense ? activeExpense.kwh / 30 : 0;

  return (
    <SafeScreen>
      <View style={s.wrap}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M19 12H5M12 19l-7-7 7-7" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
            </TouchableOpacity>
            <Text style={s.title}>Analytics</Text>
            <TouchableOpacity onPress={() => setExpensesSheetVisible(true)} style={{ padding: 4 }}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M12 5v.01M12 12v.01M12 19v.01" stroke="#2D3250" strokeWidth={3} strokeLinecap="round" /></Svg>
            </TouchableOpacity>
          </View>
          
          {displayExpenses.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>No historical data yet.</Text>
              <Text style={s.emptySub}>Start using your devices and use 'Generate Demo History' in Profile to see your progress here!</Text>
            </View>
          ) : (
            <>
              <View style={s.chartWrap}>
                <BarChart data={chartData} width={width - 40} height={180} activeIndex={activeBar} />
              </View>

              <View style={s.badgeRow}>
                <View style={s.badgeCost}>
                  <Text style={s.badgeCostLabel}>Avg Daily Cost</Text>
                  <Text style={s.badgeCostValue}>${todayCost.toFixed(2)}</Text>
                </View>
                <View style={s.badgeKwh}>
                  <Text style={s.badgeKwhLabel}>Avg Daily Usage</Text>
                  <Text style={s.badgeKwhValue}>{todayKwh.toFixed(1)} kWh</Text>
                </View>
              </View>

              <Text style={s.expTitle}>Energy Hogs (by Room)</Text>
              <View style={s.hogCard}>
                {roomBreakdown.map((r, i) => (
                  <View key={r.name} style={s.hogRow}>
                    <View style={s.hogInfo}>
                      <Text style={s.hogName}>{r.name}</Text>
                      <Text style={s.hogValue}>${r.cost.toFixed(2)}</Text>
                    </View>
                    <View style={s.hogBarBg}>
                      <View style={[s.hogBarFill, { width: `${totalCurrentCost > 0 ? (r.cost / totalCurrentCost) * 100 : 0}%`, backgroundColor: i === 0 ? '#C55A5A' : '#C5A85F' }]} />
                    </View>
                  </View>
                ))}
              </View>

              <Text style={s.expTitle}>Expenses History</Text>
              {displayExpenses.slice().reverse().map((e, idx) => {
                const origIndex = displayExpenses.length - 1 - idx;
                return (
                  <ExpenseRow 
                    key={e.id} 
                    month={e.month + ' ' + e.year} 
                    kwh={e.kwh} 
                    cost={e.cost} 
                    onPress={() => setActiveBar(origIndex)}
                  />
                )
              })}
            </>
          )}
        </ScrollView>
        <BottomNav />
      </View>
      <ExpensesSheet 
        visible={isExpensesSheetVisible} 
        onClose={() => setExpensesSheetVisible(false)} 
      />
    </SafeScreen>
  );
}

const s = StyleSheet.create({
  wrap:{flex:1,backgroundColor:'#F5F5F7'},
  scroll:{paddingHorizontal:20,paddingTop:10,paddingBottom:20},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},
  title:{fontSize:17,fontWeight:'600',color:'#2D3250'},
  toggleWrap:{flexDirection:'row',backgroundColor:'#E8E8ED',borderRadius:12,padding:3,marginBottom:20,alignSelf:'center'},
  toggleBtn:{paddingHorizontal:28,paddingVertical:10,borderRadius:10},
  toggleActive:{backgroundColor:'#FFF'},
  toggleText:{fontSize:13,color:'#8E8E93',fontWeight:'500'},
  toggleTextActive:{color:'#2D3250',fontWeight:'600'},
  chartWrap:{marginBottom:20},
  badgeRow:{flexDirection:'row',gap:12,marginBottom:24},
  badgeCost:{flex:1,backgroundColor:'#C55A5A',borderRadius:14,padding:14,alignItems:'center'},
  badgeCostLabel:{fontSize:11,color:'rgba(255,255,255,0.8)',marginBottom:4},
  badgeCostValue:{fontSize:17,fontWeight:'700',color:'#FFF'},
  badgeKwh:{flex:1,backgroundColor:'#F0F0F5',borderRadius:14,padding:14,alignItems:'center'},
  badgeKwhLabel:{fontSize:11,color:'#8E8E93',marginBottom:4},
  badgeKwhValue:{fontSize:17,fontWeight:'700',color:'#2D3250'},
  expTitle:{fontSize:18,fontWeight:'700',color:'#2D3250',marginBottom:14},
  hogCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, marginBottom: 24 },
  hogRow: { marginBottom: 16 },
  hogInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  hogName: { fontSize: 14, fontWeight: '600', color: '#2D3250' },
  hogValue: { fontSize: 14, fontWeight: '700', color: '#2D3250' },
  hogBarBg: { height: 6, backgroundColor: '#F0F0F5', borderRadius: 3, overflow: 'hidden' },
  hogBarFill: { height: '100%', borderRadius: 3 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#2D3250', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
});