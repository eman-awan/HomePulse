import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useDeviceStore } from '../../store/useDeviceStore';
import BarChart from '../../components/BarChart';
import ExpenseRow from '../../components/ExpenseRow';
import BottomNav from '../../components/BottomNav';
import SafeScreen from '../../components/SafeScreen';
import ExpensesSheet from '../../components/ExpensesSheet';

const { width } = Dimensions.get('window');

export default function Details() {
  const router = useRouter();
  const { monthlyExpenses, fetchMonthlyExpenses } = useDeviceStore();
  const [viewMode, setViewMode] = useState<'monthly'|'yearly'>('monthly');
  const [activeBar, setActiveBar] = useState(0);
  const [isExpensesSheetVisible, setExpensesSheetVisible] = useState(false);

  useEffect(() => { fetchMonthlyExpenses(); }, []);

  // Filter and sort for the chart based on viewMode. 
  // Simplified for demo: Just showing the most recent 6 items for monthly.
  const displayExpenses = monthlyExpenses.slice(0, 6).reverse();

  const chartData = displayExpenses.map(e => ({
    label: e.month.substring(0, 3),
    value: e.cost / 1000,
  }));

  const activeExpense = displayExpenses[activeBar];

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
            <Text style={s.title}>Details</Text>
            <TouchableOpacity onPress={() => setExpensesSheetVisible(true)} style={{ padding: 4 }}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M12 5v.01M12 12v.01M12 19v.01" stroke="#2D3250" strokeWidth={3} strokeLinecap="round" /></Svg>
            </TouchableOpacity>
          </View>
          
          {displayExpenses.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>No historical data yet.</Text>
              <Text style={s.emptySub}>Start using your devices and use 'Simulate Month End' in Profile to see your progress here!</Text>
            </View>
          ) : (
            <>
              <View style={s.toggleWrap}>
                <TouchableOpacity style={[s.toggleBtn, viewMode==='monthly' && s.toggleActive]} onPress={()=>setViewMode('monthly')}>
                  <Text style={[s.toggleText, viewMode==='monthly' && s.toggleTextActive]}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.toggleBtn, viewMode==='yearly' && s.toggleActive]} onPress={()=>setViewMode('yearly')}>
                  <Text style={[s.toggleText, viewMode==='yearly' && s.toggleTextActive]}>Yearly</Text>
                </TouchableOpacity>
              </View>

              <View style={s.chartWrap}>
                <BarChart data={chartData} width={width - 40} height={200} activeIndex={activeBar} />
              </View>

              <View style={s.badgeRow}>
                <View style={s.badgeCost}>
                  <Text style={s.badgeCostLabel}>Daily Avg Cost</Text>
                  <Text style={s.badgeCostValue}>${todayCost.toFixed(2)}</Text>
                </View>
                <View style={s.badgeKwh}>
                  <Text style={s.badgeKwhLabel}>Daily Avg Electricity</Text>
                  <Text style={s.badgeKwhValue}>{todayKwh.toFixed(1)} KWH</Text>
                </View>
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
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#2D3250', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
});