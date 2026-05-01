import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ExpenseRowProps {
  month: string;
  kwh?: number;
  cost: number;
  onPress?: () => void;
}

const ChevronRight = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke="#8E8E93" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function ExpenseRow({ month, kwh, cost, onPress }: ExpenseRowProps) {
  const formatCost = (c: number) => {
    if (c >= 1000) {
      return `$${c.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}`;
    }
    return `$${c.toFixed(2)}`;
  };

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#C5A85F" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
      <View style={styles.info}>
        <Text style={styles.month}>{month}</Text>
        {kwh !== undefined && <Text style={styles.kwh}>{kwh.toFixed(1)} KWH</Text>}
      </View>
      <View style={styles.right}>
        <Text style={styles.cost}>{formatCost(cost)}</Text>
        <ChevronRight />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FDF6E3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  month: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3250',
  },
  kwh: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cost: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3250',
  },
});
