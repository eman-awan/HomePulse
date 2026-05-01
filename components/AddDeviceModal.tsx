import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import InputField from './InputField';
import { useDeviceStore, Device } from '../store/useDeviceStore';

interface AddDeviceModalProps {
  visible: boolean;
  onClose: () => void;
  initialDevice?: Device | null; // If passed, we are in Edit Mode
}

const CloseIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke="#2D3250" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function AddDeviceModal({ visible, onClose, initialDevice }: AddDeviceModalProps) {
  const { rooms, addDevice, updateDevice } = useDeviceStore();
  
  const [name, setName] = useState('');
  const [type, setType] = useState('light');
  const [roomId, setRoomId] = useState(rooms[0]?.id || 1);
  const [energyRate, setEnergyRate] = useState('');
  const [count, setCount] = useState('1');
  const [error, setError] = useState('');

  const types = [
    { id: 'light', name: 'Lightings', icon: 'bulb' },
    { id: 'ac', name: 'Air Condition', icon: 'ac' },
    { id: 'tv', name: 'Smart TV', icon: 'tv' },
    { id: 'blinds', name: 'Blinds', icon: 'blinds' },
    { id: 'music', name: 'Music System', icon: 'music' },
  ];

  useEffect(() => {
    if (visible) {
      if (initialDevice) {
        setName(initialDevice.name);
        setType(initialDevice.type);
        setRoomId(initialDevice.room_id);
        setEnergyRate(initialDevice.energy_rate.toString());
        setCount(initialDevice.device_count.toString());
      } else {
        setName('');
        setType('light');
        setRoomId(rooms[0]?.id || 1);
        setEnergyRate('');
        setCount('1');
      }
      setError('');
    }
  }, [visible, initialDevice, rooms]);

  const handleSave = () => {
    setError('');
    if (!name || !energyRate || !count) {
      setError('Please fill in all fields');
      return;
    }

    const rate = parseFloat(energyRate);
    const c = parseInt(count);

    if (isNaN(rate) || isNaN(c)) {
      setError('Invalid numbers for rate or count');
      return;
    }

    const selectedType = types.find(t => t.id === type);
    const icon = selectedType?.icon || 'bulb';
    
    if (initialDevice) {
      updateDevice(initialDevice.id, name, type, roomId, rate, c, icon);
    } else {
      addDevice(name, type, roomId, rate, c, icon);
    }
    
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{initialDevice ? 'Edit Device' : 'Add New Device'}</Text>
            <TouchableOpacity onPress={onClose}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            <InputField
              label="Device Name"
              placeholder="e.g. Philips Hue"
              value={name}
              onChangeText={(text) => { setName(text); setError(''); }}
            />

            <Text style={styles.label}>Device Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {types.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typePill, type === t.id && styles.typePillActive]}
                  onPress={() => setType(t.id)}
                >
                  <Text style={[styles.typeText, type === t.id && styles.typeTextActive]}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Assign to Room</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {rooms.map(r => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.typePill, roomId === r.id && styles.typePillActive]}
                  onPress={() => setRoomId(r.id)}
                >
                  <Text style={[styles.typeText, roomId === r.id && styles.typeTextActive]}>{r.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <InputField
              label="Energy Rate ($/hr)"
              placeholder="e.g. 5"
              value={energyRate}
              onChangeText={(text) => { setEnergyRate(text); setError(''); }}
              keyboardType="numeric"
            />

            <InputField
              label="Device Count"
              placeholder="e.g. 2"
              value={count}
              onChangeText={(text) => { setCount(text); setError(''); }}
              keyboardType="numeric"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>{initialDevice ? 'Save Changes' : 'Add Device'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
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
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3250',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3250',
    marginBottom: 8,
    marginTop: 8,
  },
  typeScroll: {
    marginBottom: 16,
  },
  typePill: {
    backgroundColor: '#E8E8ED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  typePillActive: {
    backgroundColor: '#2D3250',
  },
  typeText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#C55A5A',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#2D3250',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
