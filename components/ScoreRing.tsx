import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Colors, { getLevelColor } from '../constants/Colors';

interface ScoreRingProps {
  level: string;
  size?: number;
  strokeWidth?: number;
  label: string;
}

export default function ScoreRing({
  level,
  size = 60,
  strokeWidth = 4,
  label
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = getLevelColor(level);

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.background.tertiary}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Full colored circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.levelContainer}>
          <Text style={[styles.levelText, { color, fontSize: size * 0.18 }]} numberOfLines={1}>
            {level}
          </Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ringContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  levelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
