import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, LayoutAnimation, Modal, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useDeviceStore, Device } from '../store/useDeviceStore';
import ProgressBar from './ProgressBar';
import { DeviceIcon } from './DeviceCard';
import DeviceModal from './AddDeviceModal';

const { height } = Dimensions.get('window');
const COLORS = ['#C5A85F', '#1f233a', '#6B8E9B', '#C55A5A', '#645970'];

interface ExpensesSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function ExpensesSheet({ visible, onClose }: ExpensesSheetProps) {
  const { devices, fetchDevices, removeDevice } = useDeviceStore();
  const [isDeviceModalVisible, setIsDeviceModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => { 
    if (visible) fetchDevices(); 
  }, [visible]);

  const deviceMap = new Map<string, { id: number, name: string; icon: string; count: number; cost: number; original: Device }>();
  
  devices.forEach(d => {
    const key = d.type;
    if (deviceMap.has(key)) {
      const existing = deviceMap.get(key)!;
      existing.count += d.device_count;
      existing.cost += d.monthly_cost;
    } else {
      deviceMap.set(key, { id: d.id, name: d.name, icon: d.icon, count: d.device_count, cost: d.monthly_cost, original: d });
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
             const devicesToRemove = devices.filter(d => d.type === type);
             devicesToRemove.forEach(d => removeDevice(d.id));
          }
        }
      ]
    );
  };

  const handleDevicePress = (device: Device) => {
    setSelectedDevice(device);
    setIsDeviceModalVisible(true);
  };

  const handleAddNew = () => {
    setSelectedDevice(null);
    setIsDeviceModalVisible(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          {/* Drag Handle Indicator */}
          <View style={styles.dragHandleWrap}>
            <View style={styles.dragHandle} />
          </View>
          
          <View style={styles.header}>
            <Text style={styles.title}>Expenses</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6l12 12" stroke="#1f233a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {uniqueDevices.map((d, i) => (
              <TouchableOpacity 
                key={d.name + i} 
                style={styles.row}
                onPress={() => handleDevicePress(d.original)}
                onLongPress={() => confirmDelete(d.icon, d.name)}
                delayLongPress={500}
                activeOpacity={0.7}
              >
                <View style={styles.rowTop}>
                  <View style={styles.iconWrap}>
                    <DeviceIcon icon={d.icon} color="#1f233a" />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.dName}>{d.name}</Text>
                    <Text style={styles.dSub}>{d.count} Device{d.count !== 1 ? 's' : ''} · (${d.cost.toFixed(2)})</Text>
                  </View>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 18l6-6-6-6" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <ProgressBar progress={d.cost / maxCost} color={COLORS[i % COLORS.length]} bgColor="#F0F0F5" height={6} />
              </TouchableOpacity>
            ))}
            
            {uniqueDevices.length === 0 && (
              <Text style={{textAlign: 'center', color: '#8E8E93', marginTop: 20}}>No devices found. Add one below!</Text>
            )}

            <TouchableOpacity style={styles.addBtn} onPress={handleAddNew}>
              <Text style={styles.addBtnText}>ADD NEW DEVICE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <DeviceModal 
          visible={isDeviceModalVisible} 
          onClose={() => setIsDeviceModalVisible(false)} 
          initialDevice={selectedDevice}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F5F5F7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85, // takes up 85% of screen
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3250',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  row: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  dName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3250',
  },
  dSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#2D3250',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
