import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { CapturedImages } from '../types';

const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';

interface AnalyzingOverlayProps {
  images: CapturedImages | null;
  isVisible: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const STATUS_MESSAGES = [
  'Analyzing front view',
  'Checking the sides',
  'Inspecting the back',
  'Evaluating the blend',
  'Checking symmetry',
  'Preparing your results',
];

const ANGLE_LABELS = ['Front', 'Left', 'Right', 'Back'];

export default function AnalyzingOverlay({ images, isVisible }: AnalyzingOverlayProps) {
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Scan line animation
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    scanAnimation.start();
    pulseAnimation.start();

    // Status message rotation
    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % STATUS_MESSAGES.length);
    }, 1200);

    return () => {
      scanAnimation.stop();
      pulseAnimation.stop();
      clearInterval(statusInterval);
    };
  }, [isVisible, scanLineAnim, pulseAnim]);

  if (!isVisible || !images) return null;

  const imageArray = [images.front, images.leftSide, images.rightSide, images.back];
  const gridSize = SCREEN_WIDTH * 0.85;
  const imageSize = (gridSize - 12) / 2; // 12px gap total

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, gridSize],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.gridContainer,
          {
            width: gridSize,
            height: gridSize,
            transform: [{ scale: pulseAnim }]
          }
        ]}
      >
        {/* 2x2 Grid of Images */}
        <View style={styles.imageGrid}>
          {imageArray.map((uri, index) => (
            <View key={index} style={[styles.imageWrapper, { width: imageSize, height: imageSize }]}>
              <Image source={{ uri }} style={styles.image} />
              <View style={styles.imageOverlay} />
              <View style={styles.labelContainer}>
                <Text style={styles.labelText}>{ANGLE_LABELS[index]}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Scan line with gradient */}
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: scanLineTranslateY }] },
          ]}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, CYAN_GLOW] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scanLineGradient}
          />
        </Animated.View>
      </Animated.View>

      <View style={styles.statusContainer}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, statusIndex > 1 && styles.dotActive]} />
          <View style={[styles.dot, statusIndex > 3 && styles.dotActive]} />
        </View>
        <Text style={styles.statusText}>{STATUS_MESSAGES[statusIndex]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ACCENT_BLUE,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  imageGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    padding: 2,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    overflow: 'hidden',
  },
  scanLineGradient: {
    flex: 1,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  statusContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  dot: {
    width: 24,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#252530',
  },
  dotActive: {
    backgroundColor: ACCENT_BLUE,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
});
