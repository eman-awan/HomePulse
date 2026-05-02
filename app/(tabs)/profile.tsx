import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useDeviceStore } from '../../store/useDeviceStore';
import InputField from '../../components/InputField';
import BottomNav from '../../components/BottomNav';
import SafeScreen from '../../components/SafeScreen';

const LogoutIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="#C55A5A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function Profile() {
  const router = useRouter();
  const { user, logout, updateBudget } = useAuthStore();
  const { devices, rooms, utilityRate, updateUtilityRate, generateHistory } = useDeviceStore();
  
  const [budgetInput, setBudgetInput] = useState(user?.budget_limit?.toString() || '500');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [utilityInput, setUtilityInput] = useState(utilityRate.toString());
  const [isEditingUtility, setIsEditingUtility] = useState(false);

  const handleSaveBudget = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      updateBudget(newBudget);
      setIsEditingBudget(false);
    } else {
      Alert.alert('Error', 'Please enter a valid budget amount.');
      setBudgetInput(user?.budget_limit?.toString() || '500');
    }
  };

  const handleSaveUtility = () => {
    const newRate = parseFloat(utilityInput);
    if (!isNaN(newRate) && newRate > 0) {
      updateUtilityRate(newRate);
      setIsEditingUtility(false);
    } else {
      Alert.alert('Error', 'Please enter a valid rate.');
      setUtilityInput(utilityRate.toString());
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/welcome');
        }
      }
    ]);
  };

  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'Unknown';

  return (
    <SafeScreen>
      <View style={s.wrap}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <Text style={s.pageTitle}>Profile</Text>

          <View style={s.profileCard}>
            <View style={s.avatarWrap}>
              <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="8" r="4" fill="#C5A85F" />
                <Path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" fill="#C5A85F" />
              </Svg>
            </View>
            <Text style={s.name}>{user?.name || 'User'}</Text>
            <Text style={s.email}>{user?.email || 'email@example.com'}</Text>
            <Text style={s.joined}>Joined {joinedDate}</Text>
          </View>

          <View style={s.statsRow}>
            <View style={s.statBox}>
              <Text style={s.statValue}>{rooms.length}</Text>
              <Text style={s.statLabel}>Rooms</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statValue}>{devices.length}</Text>
              <Text style={s.statLabel}>Devices</Text>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>System Settings</Text>
            
            <View style={s.budgetContainer}>
              {/* Budget Setting */}
              {isEditingBudget ? (
                <View style={s.budgetEditRow}>
                  <View style={{flex: 1}}>
                    <InputField
                      label="Monthly Budget Limit ($)"
                      placeholder="e.g. 500"
                      value={budgetInput}
                      onChangeText={setBudgetInput}
                      keyboardType="numeric"
                    />
                  </View>
                  <TouchableOpacity style={s.saveBtn} onPress={handleSaveBudget}>
                    <Text style={s.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={s.settingRow} onPress={() => setIsEditingBudget(true)}>
                  <View>
                    <Text style={s.settingLabel}>Monthly Budget Limit</Text>
                    <Text style={s.settingValue}>${user?.budget_limit?.toFixed(2) || '500.00'}</Text>
                  </View>
                  <Text style={s.editLink}>Edit</Text>
                </TouchableOpacity>
              )}

              <View style={{ height: 1, backgroundColor: '#F0F0F5', marginVertical: 16 }} />

              {/* Utility Rate Setting */}
              {isEditingUtility ? (
                <View style={s.budgetEditRow}>
                  <View style={{flex: 1}}>
                    <InputField
                      label="Utility Rate ($/kWh)"
                      placeholder="e.g. 0.12"
                      value={utilityInput}
                      onChangeText={setUtilityInput}
                      keyboardType="numeric"
                    />
                  </View>
                  <TouchableOpacity style={s.saveBtn} onPress={handleSaveUtility}>
                    <Text style={s.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={s.settingRow} onPress={() => setIsEditingUtility(true)}>
                  <View>
                    <Text style={s.settingLabel}>Electricity Rate ($/kWh)</Text>
                    <Text style={s.settingValue}>${utilityRate.toFixed(2)} per kWh</Text>
                  </View>
                  <Text style={s.editLink}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={[s.sectionTitle, { marginTop: 24 }]}>Professional Tools</Text>
            <View style={s.simCard}>
              <TouchableOpacity style={s.simBtn} onPress={() => {
                useDeviceStore.getState().syncAllRoomBudgets();
                Alert.alert('Success', 'All room budgets optimized based on your appliances!');
              }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 13h.01M12 13h.01M15 13h.01M12 17h.01M16 21H8a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v14a2 2 0 01-2 2z" stroke="#C5A85F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={s.simBtnText}>Sync Smart Budgets</Text>
              </TouchableOpacity>

              <View style={{ height: 1, backgroundColor: '#F0F0F5', marginVertical: 12 }} />

              <TouchableOpacity style={s.simBtn} onPress={() => {
                useDeviceStore.getState().simulateMonthEnd();
                Alert.alert('Success', 'Current usage consolidated to history!');
              }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#C5A85F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={s.simBtnText}>Consolidate Month End</Text>
              </TouchableOpacity>
              
              <View style={{ height: 1, backgroundColor: '#F0F0F5', marginVertical: 12 }} />

              <TouchableOpacity style={s.simBtn} onPress={() => {
                generateHistory();
                Alert.alert('Success', 'Generated 6 months of realistic energy history!');
              }}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6M14 19v-8a2 2 0 00-2-2h-2a2 2 0 00-2 2v8M19 19v-10a2 2 0 00-2-2h-2a2 2 0 00-2 2v10" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={[s.simBtnText, { color: '#2D3250' }]}>Generate Demo History</Text>
              </TouchableOpacity>
              <Text style={s.simDesc}>Populate your charts with seasonal data to see the app in full professional use.</Text>
            </View>
          </View>

          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <LogoutIcon />
            <Text style={s.logoutText}>Logout</Text>
          </TouchableOpacity>

        </ScrollView>
        <BottomNav />
      </View>
    </SafeScreen>
  );
}

const s = StyleSheet.create({
  wrap:{flex:1,backgroundColor:'#F5F5F7'},
  scroll:{paddingHorizontal:20,paddingTop:20,paddingBottom:20},
  pageTitle:{fontSize:24,fontWeight:'800',color:'#2D3250',marginBottom:24},
  
  profileCard:{backgroundColor:'#FFF',borderRadius:20,padding:24,alignItems:'center',marginBottom:20,elevation:2,shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:8},
  avatarWrap:{width:80,height:80,borderRadius:40,backgroundColor:'#F0F0F5',justifyContent:'center',alignItems:'center',marginBottom:16},
  name:{fontSize:20,fontWeight:'700',color:'#2D3250',marginBottom:4},
  email:{fontSize:14,color:'#8E8E93',marginBottom:8},
  joined:{fontSize:12,color:'#C5A85F',fontWeight:'500',backgroundColor:'rgba(197,168,95,0.1)',paddingHorizontal:10,paddingVertical:4,borderRadius:10},
  
  statsRow:{flexDirection:'row',gap:16,marginBottom:32},
  statBox:{flex:1,backgroundColor:'#2D3250',borderRadius:16,padding:20,alignItems:'center'},
  statValue:{fontSize:28,fontWeight:'800',color:'#FFF',marginBottom:4},
  statLabel:{fontSize:13,color:'rgba(255,255,255,0.7)'},
  
  section:{marginBottom:32},
  sectionTitle:{fontSize:18,fontWeight:'700',color:'#2D3250',marginBottom:16},
  budgetContainer:{backgroundColor:'#FFF',borderRadius:16,padding:16},
  settingRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  settingLabel:{fontSize:15,color:'#2D3250',fontWeight:'500',marginBottom:4},
  settingValue:{fontSize:14,color:'#8E8E93'},
  editLink:{color:'#C5A85F',fontWeight:'600',fontSize:14},
  
  budgetEditRow:{flexDirection:'row',alignItems:'center',gap:12},
  saveBtn:{backgroundColor:'#2D3250',paddingHorizontal:20,height:56,borderRadius:12,justifyContent:'center',marginTop:20},
  saveBtnText:{color:'#FFF',fontWeight:'600'},
  
  logoutBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#FFF5F5',padding:16,borderRadius:16,gap:8},
  logoutText:{color:'#C55A5A',fontSize:16,fontWeight:'600'},

  simCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  simBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  simBtnText: { color: '#C5A85F', fontWeight: '700', fontSize: 16 },
  simDesc: { fontSize: 12, color: '#8E8E93', lineHeight: 18 },
});
