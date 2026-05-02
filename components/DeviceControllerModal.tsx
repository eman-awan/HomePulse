import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Switch } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useDeviceStore } from '../store/useDeviceStore';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  device: any;
}

const Slider = ({ value, onValueChange, label, min = 0, max = 100 }: any) => (
  <View style={s.sliderWrap}>
    <View style={s.sliderHeader}>
      <Text style={s.sliderLabel}>{label}</Text>
      <Text style={s.sliderValue}>{Math.round(value)}</Text>
    </View>
    <View style={s.sliderTrack}>
      <View style={[s.sliderFill, { width: `${((value - min) / (max - min)) * 100}%` }]} />
    </View>
  </View>
);

export default function DeviceControllerModal({ visible, onClose, device: initialDevice }: Props) {
  const { updateDeviceProperty, toggleDevice, devices } = useDeviceStore();
  
  // Find the live device state from the store to ensure reactive updates
  const device = devices.find(d => d.id === initialDevice?.id) || initialDevice;

  if (!device) return null;

  const renderAC = () => (
    <View>
      <View style={s.tempCircle}>
        <Text style={s.tempMain}>{device.value || 24}°C</Text>
        <Text style={s.tempSub}>Indoor Temp</Text>
      </View>

      <View style={s.controlsRow}>
        <TouchableOpacity 
          style={s.roundBtn} 
          onPress={() => updateDeviceProperty(device.id, 'value', (device.value || 24) - 1)}
        >
          <Text style={s.roundBtnText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={s.roundBtn} 
          onPress={() => updateDeviceProperty(device.id, 'value', (device.value || 24) + 1)}
        >
          <Text style={s.roundBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={s.modeRow}>
        {['cool', 'heat', 'fan', 'dry'].map(m => (
          <TouchableOpacity 
            key={m} 
            style={[s.modeBtn, device.mode === m && s.modeBtnActive]}
            onPress={() => updateDeviceProperty(device.id, 'mode', m)}
          >
            <Text style={[s.modeBtnText, device.mode === m && s.modeBtnTextActive]}>{m.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFan = () => (
    <View>
      <View style={s.speedHeader}>
        <Text style={s.speedTitle}>Fan Speed</Text>
        <Text style={s.speedValue}>Level {device.value || 1}</Text>
      </View>
      <View style={s.speedRow}>
        {[1, 2, 3, 4, 5].map(v => (
          <TouchableOpacity 
            key={v} 
            style={[s.speedBtn, device.value === v && s.speedBtnActive]}
            onPress={() => updateDeviceProperty(device.id, 'value', v)}
          >
            <Text style={[s.speedBtnText, device.value === v && s.speedBtnTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={s.optionRow}>
        <Text style={s.optionLabel}>Swing Mode</Text>
        <Switch 
          value={device.secondary_value === 1} 
          onValueChange={(val) => updateDeviceProperty(device.id, 'secondary_value', val ? 1 : 0)} 
          trackColor={{ false: '#D1D1D6', true: '#C5A85F' }}
        />
      </View>
    </View>
  );

  const renderTV = () => (
    <View>
      <View style={s.tvDisplay}>
        <Text style={s.channelNum}>{Math.floor(device.secondary_value || 101)}</Text>
        <Text style={s.channelName}>Discovery HD</Text>
      </View>

      <View style={s.remoteGrid}>
        <View style={s.remoteCol}>
          <TouchableOpacity 
            style={s.remoteBtn} 
            onPress={() => updateDeviceProperty(device.id, 'secondary_value', (device.secondary_value || 101) + 1)}
          >
            <Text style={s.remoteBtnText}>CH+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={s.remoteBtn}
            onPress={() => updateDeviceProperty(device.id, 'secondary_value', (device.secondary_value || 101) - 1)}
          >
            <Text style={s.remoteBtnText}>CH-</Text>
          </TouchableOpacity>
        </View>

        <View style={s.remoteCol}>
          <TouchableOpacity 
            style={s.remoteBtn}
            onPress={() => updateDeviceProperty(device.id, 'value', Math.min(100, (device.value || 20) + 5))}
          >
            <Text style={s.remoteBtnText}>VOL+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={s.remoteBtn}
            onPress={() => updateDeviceProperty(device.id, 'value', Math.max(0, (device.value || 20) - 5))}
          >
            <Text style={s.remoteBtnText}>VOL-</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.volBar}>
        <View style={[s.volFill, { width: `${device.value || 20}%` }]} />
      </View>
    </View>
  );

  const renderCamera = () => (
    <View>
      <View style={s.camView}>
        <View style={s.camOverlay}>
          <View style={s.recDot} />
          <Text style={s.recText}>LIVE - 1080P</Text>
        </View>
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="3" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
          <Path d="M22 12c-2.5 4-6 6-10 6s-7.5-2-10-6c2.5-4 6-6 10-6s7.5 2 10 6z" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
        </Svg>
      </View>

      <View style={s.dPad}>
        <TouchableOpacity style={[s.dBtn, { top: 0 }]}>
          <Text style={s.dBtnText}>▲</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.dBtn, { bottom: 0 }]}>
          <Text style={s.dBtnText}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.dBtn, { left: 0 }]}>
          <Text style={s.dBtnText}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.dBtn, { right: 0 }]}>
          <Text style={s.dBtnText}>▶</Text>
        </TouchableOpacity>
        <View style={s.dCenter} />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.overlay}>
        <TouchableOpacity style={s.dim} onPress={onClose} activeOpacity={1} />
        <View style={s.content}>
          <View style={s.indicator} />
          <View style={s.header}>
            <View>
              <Text style={s.deviceName}>{device.name}</Text>
              <Text style={s.roomName}>Connected to Hub</Text>
            </View>
            <Switch 
              value={device.status === 1} 
              onValueChange={() => toggleDevice(device.id, device.status)}
              trackColor={{ false: '#D1D1D6', true: '#C5A85F' }}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
            {device.type === 'ac' && renderAC()}
            {device.type === 'fan' && renderFan()}
            {device.type === 'tv' && renderTV()}
            {device.type === 'camera' && renderCamera()}
            {(!['ac', 'fan', 'tv', 'camera'].includes(device.type)) && (
               <View style={s.genericControl}>
                 <Text style={s.genericText}>Standard Device Controller</Text>
                 <Slider label="Intensity / Power" value={device.value || 0} onValueChange={(v: number) => updateDeviceProperty(device.id, 'value', v)} />
               </View>
            )}
          </ScrollView>

          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  content: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24, 
    height: height * 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20
  },
  indicator: { width: 40, height: 4, backgroundColor: '#E8E8ED', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  deviceName: { fontSize: 24, fontWeight: '700', color: '#2D3250' },
  roomName: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  scroll: { paddingBottom: 40 },
  
  // AC
  tempCircle: { width: 160, height: 160, borderRadius: 80, borderWeight: 2, borderColor: '#F0F0F5', alignSelf: 'center', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9FB', marginBottom: 30 },
  tempMain: { fontSize: 44, fontWeight: '700', color: '#2D3250' },
  tempSub: { fontSize: 12, color: '#8E8E93' },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginBottom: 40 },
  roundBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2D3250', justifyContent: 'center', alignItems: 'center' },
  roundBtnText: { fontSize: 32, color: '#FFF', fontWeight: '300' },
  modeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F0F0F5', alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#C5A85F' },
  modeBtnText: { fontSize: 10, fontWeight: '700', color: '#8E8E93' },
  modeBtnTextActive: { color: '#FFF' },

  // FAN
  speedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 },
  speedTitle: { fontSize: 18, fontWeight: '700', color: '#2D3250' },
  speedValue: { fontSize: 16, fontWeight: '600', color: '#C5A85F' },
  speedRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  speedBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F0F5', justifyContent: 'center', alignItems: 'center' },
  speedBtnActive: { backgroundColor: '#2D3250' },
  speedBtnText: { fontSize: 18, fontWeight: '700', color: '#2D3250' },
  speedBtnTextActive: { color: '#FFF' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#F9F9FB', borderRadius: 16 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: '#2D3250' },

  // TV
  tvDisplay: { height: 120, backgroundColor: '#2D3250', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  channelNum: { fontSize: 40, fontWeight: '800', color: '#C5A85F' },
  channelName: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  remoteGrid: { flexDirection: 'row', justifyContent: 'space-around', gap: 20, marginBottom: 40 },
  remoteCol: { gap: 12 },
  remoteBtn: { width: 80, height: 60, borderRadius: 16, backgroundColor: '#F0F0F5', justifyContent: 'center', alignItems: 'center' },
  remoteBtnText: { fontSize: 14, fontWeight: '700', color: '#2D3250' },
  volBar: { height: 8, backgroundColor: '#F0F0F5', borderRadius: 4, overflow: 'hidden' },
  volFill: { height: '100%', backgroundColor: '#C5A85F' },

  // CAMERA
  camView: { height: 220, backgroundColor: '#000', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 30, overflow: 'hidden' },
  camOverlay: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4B4B' },
  recText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  dPad: { width: 180, height: 180, alignSelf: 'center', position: 'relative' },
  dBtn: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: '#F0F0F5', justifyContent: 'center', alignItems: 'center' },
  dBtnText: { fontSize: 20, color: '#2D3250' },
  dCenter: { position: 'absolute', top: 60, left: 60, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', borderWeight: 2, borderColor: '#E8E8ED' },

  // GENERIC
  genericControl: { padding: 20, backgroundColor: '#F9F9FB', borderRadius: 20 },
  genericText: { fontSize: 16, fontWeight: '600', color: '#2D3250', marginBottom: 20 },
  sliderWrap: { marginTop: 10 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sliderLabel: { fontSize: 14, color: '#8E8E93' },
  sliderValue: { fontSize: 14, fontWeight: '700', color: '#2D3250' },
  sliderTrack: { height: 6, backgroundColor: '#F0F0F5', borderRadius: 3 },
  sliderFill: { height: '100%', backgroundColor: '#C5A85F', borderRadius: 3 },

  closeBtn: { backgroundColor: '#2D3250', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 'auto' },
  closeBtnText: { color: '#FFF', fontWeight: '700', letterSpacing: 2 }
});
