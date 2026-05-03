import React, { useRef } from 'react';
import { View, Text, Switch, StyleSheet, Animated, Pressable, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface DeviceCardProps {
  name: string;
  deviceCount: number;
  isOn: boolean;
  icon: string;
  onToggle: () => void;
  onPress: () => void;
  onEdit?: () => void;
  variant?: 'home' | 'room';
}

export const DeviceIcon = ({ icon, color }: { icon: string; color: string }) => {
  const size = 24;
  switch (icon) {
    case 'bulb':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 21h6M12 3a6 6 0 0 0-4 10.5V17h8v-3.5A6 6 0 0 0 12 3z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'blinds':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="18" height="4" rx="1" stroke={color} strokeWidth={2} />
          <Line x1="12" y1="7" x2="12" y2="21" stroke={color} strokeWidth={2} />
        </Svg>
      );
    case 'tv':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="2" y="5" width="20" height="13" rx="2" stroke={color} strokeWidth={2} />
        </Svg>
      );
    case 'ac':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="2" y="4" width="20" height="12" rx="2" stroke={color} strokeWidth={2} />
          <Path d="M6 20c0-2 2-4 6-4s6 2 6 4" stroke={color} strokeWidth={2} />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={2} />
        </Svg>
      );
  }
};

const EditIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#A0A0A0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function DeviceCard({ name, deviceCount, isOn, icon, onToggle, onPress, onEdit, variant = 'home' }: DeviceCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable 
      onPress={onPress} 
      style={{ width: '47%', marginBottom: 15 }}
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View style={[s.card, { transform: [{ scale }] }]}>
        <View style={s.topRow}>
          <View style={[s.iconWrap, isOn && s.iconWrapActive]}>
            <DeviceIcon icon={icon} color={isOn ? '#FFF' : '#2D3250'} />
          </View>
          {variant === 'home' && onEdit && (
            <TouchableOpacity onPress={onEdit} style={s.editBtn}>
              <EditIcon />
            </TouchableOpacity>
          )}
          {variant === 'room' && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{name.includes('AC') || name.includes('Cond') ? 'High' : 'Mid'}</Text>
            </View>
          )}
        </View>
        <Text style={s.name} numberOfLines={1}>{name}</Text>
        <Text style={s.count}>{deviceCount} Devices</Text>
        <View style={s.bottomRow}>
          <Switch
            value={isOn}
            onValueChange={onToggle}
            trackColor={{ false: '#D1D1D6', true: '#C5A85F' }}
            thumbColor="#FFF"
          />
          <Text style={[s.status, isOn ? s.statusOn : s.statusOff]}>{isOn ? 'ON' : 'OFF'}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F0F0F5', justifyContent: 'center', alignItems: 'center' },
  iconWrapActive: { backgroundColor: '#2D3250' },
  editBtn: { padding: 4 },
  badge: { backgroundColor: '#F9F9FB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#C5A85F' },
  name: { fontSize: 15, fontWeight: '700', color: '#2D3250', marginBottom: 2 },
  count: { fontSize: 12, color: '#8E8E93', marginBottom: 14 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  status: { fontSize: 11, fontWeight: '800' },
  statusOn: { color: '#C5A85F' },
  statusOff: { color: '#8E8E93' }
});
