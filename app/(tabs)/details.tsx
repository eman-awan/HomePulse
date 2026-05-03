import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { useDeviceStore } from '../../store/useDeviceStore';
import BarChart from '../../components/BarChart';
import BottomNav from '../../components/BottomNav';
import SafeScreen from '../../components/SafeScreen';
import ExpensesSheet from '../../components/ExpensesSheet';

const { width } = Dimensions.get('window');

const ExpenseIcon = () => (
  <View style={s.expenseIconWrap}>
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  </View>
);

export default function Details() {
  const router = useRouter();
  const { monthlyExpenses, fetchMonthlyExpenses, getTotalExpenses, getTotalKwh, getProjectedBill, devices } = useDeviceStore();
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  const [isExpensesSheetVisible, setExpensesSheetVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchMonthlyExpenses();
    }, [])
  );

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });

  const displayExpenses = (monthlyExpenses || []).slice(0, 8).reverse();
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (displayExpenses.length > 0 && activeIndex === -1) {
      const idx = displayExpenses.findIndex(e => e.month === currentMonthName);
      if (idx !== -1) setActiveIndex(idx);
    }
  }, [displayExpenses]);

  const chartData = displayExpenses.map(e => ({
    label: e.month.substring(0, 3), 
    value: e.month === currentMonthName 
      ? Math.max(1200, Math.min(5000, getProjectedBill())) 
      : Math.min(5000, e.cost),
  }));

  const totalCost = getTotalExpenses();
  const totalKwh = getTotalKwh();
  const totalTodaySpent = (devices || []).reduce((sum, d) => sum + (d.today_cost || 0), 0);

  return (
    <SafeScreen>
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/')} style={s.backBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Details</Text>
          <TouchableOpacity style={s.menuBtn} onPress={() => setExpensesSheetVisible(true)}>
             <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
               <Path d="M12 5v.01M12 12v.01M12 19v.01" stroke="#2D3250" strokeWidth={3} strokeLinecap="round" />
             </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          
          {/* Tabs */}
          <View style={s.tabWrap}>
             <TouchableOpacity 
               style={[s.tab, viewMode === 'monthly' && s.tabActive]} 
               onPress={() => setViewMode('monthly')}
             >
                <Text style={[s.tabText, viewMode === 'monthly' && s.tabTextActive]}>Monthly</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               style={[s.tab, viewMode === 'yearly' && s.tabActive]} 
               onPress={() => setViewMode('yearly')}
             >
                <Text style={[s.tabText, viewMode === 'yearly' && s.tabTextActive]}>Yearly</Text>
             </TouchableOpacity>
          </View>

          {/* Bar Chart (Image 04) */}
          <View style={s.chartBox}>
             <BarChart 
               data={chartData} 
               width={width - 50} 
               height={180} 
               activeIndex={activeIndex} 
               onSelect={(idx) => setActiveIndex(idx)}
               barColor="#E8E8ED"
               activeBarColor="#2D3250"
             />
          </View>

          {/* Today Stats Summary */}
          <View style={s.statsRow}>
             <View style={[s.statCard, s.statCardTan]}>
                <Text style={s.statLabelWhite}>Today Cost</Text>
                <Text style={s.statValueWhite}>${totalTodaySpent.toFixed(2)}</Text>
             </View>
             <View style={s.statCard}>
                <Text style={s.statLabel}>Today Electricity</Text>
                <Text style={s.statValue}>{(totalTodaySpent / (useDeviceStore.getState().utilityRate || 0.12)).toFixed(1)} KWH</Text>
             </View>
          </View>

          {/* Expenses List */}
          <View style={s.expensesHeader}>
             <Text style={s.sectionTitle}>Expenses</Text>
             <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke="#A0A0A0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
             </Svg>
          </View>

          <View style={s.expenseList}>
             {displayExpenses.slice().reverse().map((e, idx) => {
               const originalIdx = displayExpenses.length - 1 - idx;
               const isCurrentMonth = e.month === currentMonthName;
               const isActive = originalIdx === activeIndex;
               const costToDisplay = isCurrentMonth ? getProjectedBill() : e.cost;
               const kwhToDisplay = isCurrentMonth ? (costToDisplay / (useDeviceStore.getState().utilityRate || 0.12)) : e.kwh;
               
               return (
                 <TouchableOpacity 
                   key={e.id} 
                   onPress={() => setActiveIndex(originalIdx)}
                   style={[s.expenseItem, isActive && s.expenseItemActive]}
                 >
                    <View style={s.expenseLeft}>
                       <ExpenseIcon />
                       <View>
                          <Text style={s.expenseMonth}>{e.month} {isCurrentMonth && '(Projected)'}</Text>
                          <Text style={s.expenseKwh}>{kwhToDisplay.toFixed(1)} KWH</Text>
                       </View>
                    </View>
                    <Text style={s.expenseCost}>${costToDisplay.toFixed(2)}</Text>
                 </TouchableOpacity>
               );
             })}
          </View>

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
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2D3250' },
  backBtn: { padding: 5 },
  menuBtn: { padding: 5 },
  
  scroll: { paddingBottom: 100 },
  
  tabWrap: { flexDirection: 'row', backgroundColor: '#F0F0F5', marginHorizontal: 25, padding: 5, borderRadius: 14, marginBottom: 30 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#FFF', elevation: 1 },
  tabText: { fontSize: 13, color: '#A0A0A0', fontWeight: '600' },
  tabTextActive: { color: '#2D3250' },

  chartBox: { paddingHorizontal: 25, marginBottom: 40 },
  
  statsRow: { flexDirection: 'row', gap: 15, paddingHorizontal: 25, marginBottom: 30 },
  statCard: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 20, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  statCardTan: { backgroundColor: '#D4A056' },
  statLabel: { fontSize: 12, color: '#A0A0A0', marginBottom: 8 },
  statLabelWhite: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#2D3250' },
  statValueWhite: { fontSize: 18, fontWeight: '800', color: '#FFF' },

  expensesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2D3250' },
  
  expenseList: { paddingHorizontal: 25 },
  expenseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 12, elevation: 1 },
  expenseItemActive: { borderColor: '#D4A056', borderWidth: 1 },
  expenseLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  expenseIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9F9F9', justifyContent: 'center', alignItems: 'center' },
  expenseMonth: { fontSize: 15, fontWeight: '700', color: '#2D3250' },
  expenseKwh: { fontSize: 12, color: '#A0A0A0', marginTop: 2 },
  expenseCost: { fontSize: 15, fontWeight: '800', color: '#2D3250' }
});