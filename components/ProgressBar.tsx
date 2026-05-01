import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  bgColor?: string;
  height?: number;
  label?: string;
  leftText?: string;
  rightText?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({
  progress,
  color = '#2D3250',
  bgColor = '#E8E8ED',
  height = 8,
  label,
  leftText,
  rightText,
  showPercentage = false,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: clampedProgress,
      duration: 800,
      useNativeDriver: false, // width animation doesn't support native driver
    }).start();
  }, [clampedProgress]);

  const widthInterpolated = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      {(leftText || rightText) && (
        <View style={styles.labelRow}>
          {leftText && <Text style={styles.leftText}>{leftText}</Text>}
          {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        </View>
      )}
      <View style={[styles.track, { backgroundColor: bgColor, height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: widthInterpolated,
              height,
            },
          ]}
        />
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  leftText: {
    fontSize: 13,
    color: '#2D3250',
    fontWeight: '600',
  },
  rightText: {
    fontSize: 13,
    color: '#2D3250',
    fontWeight: '600',
  },
  track: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
  label: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
});
