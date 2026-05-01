import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface BarChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  barColor?: string;
  activeBarColor?: string;
  activeIndex?: number;
}

export default function BarChart({
  data,
  width = 320,
  height = 180,
  barColor = '#E8E8ED',
  activeBarColor = '#2D3250',
  activeIndex = -1,
}: BarChartProps) {
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(...data.map(d => d.value), 1);

  const barWidth = Math.min((chartWidth / data.length) * 0.5, 28);
  const barGap = (chartWidth - barWidth * data.length) / (data.length);

  // Y-axis labels
  const ySteps = 4;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) =>
    Math.round((maxValue / ySteps) * i)
  );

  const animationProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animationProgress, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: false, // Animating SVG props
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Y-axis grid lines and labels */}
        {yLabels.map((yVal, i) => {
          const y = padding.top + chartHeight - (chartHeight * yVal) / maxValue;
          return (
            <G key={`y-${i}`}>
              <Line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#F0F0F5"
                strokeWidth={1}
              />
              <SvgText
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={10}
                fill="#8E8E93"
              >
                {yVal}
              </SvgText>
            </G>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const targetBarHeight = (chartHeight * item.value) / maxValue;
          const x = padding.left + index * (barWidth + barGap) + barGap / 2;
          const targetY = padding.top + chartHeight - targetBarHeight;
          const isActive = index === activeIndex;

          const animatedHeight = animationProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, targetBarHeight]
          });

          const animatedY = animationProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [padding.top + chartHeight, targetY]
          });

          return (
            <G key={`bar-${index}`}>
              <AnimatedRect
                x={x}
                y={animatedY as any}
                width={barWidth}
                height={animatedHeight as any}
                rx={barWidth / 2}
                fill={isActive ? activeBarColor : barColor}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize={10}
                fill={isActive ? '#2D3250' : '#8E8E93'}
                fontWeight={isActive ? 'bold' : 'normal'}
              >
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
