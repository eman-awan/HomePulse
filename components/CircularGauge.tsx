import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CircularGaugeProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showArc?: boolean;
  color?: string;
  bgColor?: string;
}

export default function CircularGauge({
  value,
  maxValue,
  size = 200,
  strokeWidth = 12,
  label,
  sublabel,
  valuePrefix = '',
  valueSuffix = '',
  showArc = true,
  color = '#2D3250',
  bgColor = '#E8E8ED',
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Arc from 135° to 405° (270° sweep)
  const startAngle = 135;
  const sweepAngle = 270;
  const clampedProgress = Math.min(Math.max(value / maxValue, 0), 1);
  
  // Calculating arc length for dasharray/dashoffset
  const arcLength = (2 * Math.PI * radius * sweepAngle) / 360;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(cx, cy, r, endA);
    const end = polarToCartesian(cx, cy, r, startA);
    const largeArcFlag = endA - startA > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const fullArcPath = describeArc(center, center, radius, startAngle, startAngle + sweepAngle);

  // Animation setup
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: clampedProgress,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [clampedProgress]);

  // Dash offset: from arcLength (empty) to arcLength * (1 - progress) (filled)
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [arcLength, 0],
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc */}
        <Path
          d={fullArcPath}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Foreground Animated arc */}
        <AnimatedPath
          d={fullArcPath}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={strokeDashoffset as any}
        />
      </Svg>
      <View style={[styles.centerContent, { width: size, height: size }]}>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
        <Text style={styles.value}>
          {valuePrefix}{typeof value === 'number' && value % 1 !== 0 ? value.toFixed(2) : value}{valueSuffix}
        </Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sublabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D3250',
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
});
