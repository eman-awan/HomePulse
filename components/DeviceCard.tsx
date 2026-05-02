import React, { useRef } from 'react';
import { View, Text, Switch, StyleSheet, Animated, Pressable, TouchableOpacity } from 'react-native';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

interface DeviceCardProps {
  name: string;
  deviceCount: number;
  isOn: boolean;
  icon: string;
  onToggle: () => void;
  onPress: () => void; // New
  onLongPress?: () => void;
  onEdit?: () => void;
}

const DeviceIcon = ({ icon, color }: { icon: string; color: string }) => {
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
          <Line x1="3" y1="11" x2="21" y2="11" stroke={color} strokeWidth={2} />
          <Line x1="3" y1="15" x2="21" y2="15" stroke={color} strokeWidth={2} />
          <Line x1="3" y1="19" x2="21" y2="19" stroke={color} strokeWidth={2} />
          <Line x1="12" y1="7" x2="12" y2="21" stroke={color} strokeWidth={2} />
        </Svg>
      );
    case 'tv':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="2" y="5" width="20" height="13" rx="2" stroke={color} strokeWidth={2} />
          <Line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth={2} />
          <Line x1="12" y1="18" x2="12" y2="21" stroke={color} strokeWidth={2} />
        </Svg>
      );
    case 'ac':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="2" y="4" width="20" height="12" rx="2" stroke={color} strokeWidth={2} />
          <Path d="M6 20c0-2 2-4 6-4s6 2 6 4" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Line x1="6" y1="10" x2="18" y2="10" stroke={color} strokeWidth={2} />
        </Svg>
      );
    case 'music':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth={2} />
          <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth={2} />
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

const EditIcon = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export { DeviceIcon };

export default function DeviceCard({ name, deviceCount, isOn, icon, onToggle, onPress, onLongPress, onEdit }: DeviceCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable 
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ width: '47%', marginBottom: 14 }}
    >
      <Animated.View style={[styles.card, isOn && styles.cardActive, { transform: [{ scale }] }]}>
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, isOn && styles.iconContainerActive]}>
            <DeviceIcon icon={icon} color={isOn ? '#FFFFFF' : '#2D3250'} />
          </View>
          <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
            <EditIcon color="#8E8E93" />
          </TouchableOpacity>
        </View>
        <Text style={styles.deviceName}>{name}</Text>
        <Text style={styles.deviceCount}>{deviceCount} Devices</Text>
        <View style={styles.toggleRow}>
          <Switch
            value={isOn}
            onValueChange={onToggle}
            trackColor={{ false: '#D1D1D6', true: '#C5A85F' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#D1D1D6"
          />
          <Text style={[styles.statusText, isOn ? styles.statusOn : styles.statusOff]}>
            {isOn ? 'ON' : 'Off'}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardActive: {
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  editBtn: {
    padding: 8,
    marginTop: -8,
    marginRight: -8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#2D3250',
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3250',
    marginBottom: 2,
  },
  deviceCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusOn: {
    color: '#C5A85F',
  },
  statusOff: {
    color: '#8E8E93',
  },
});
