import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';

interface AnalyzingOverlayProps {
  imageUri: string;
  isVisible: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const STATUS_MESSAGES = [
  'Checking that lineup',
  'Analyzing the fade',
  'Rating the blend',
  'Evaluating the shape',
  'Finalizing results',
];

export default function AnalyzingOverlay({ imageUri, isVisible }: AnalyzingOverlayProps) {
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
          duration: 2000,
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
    }, 1500);

    return () => {
      scanAnimation.stop();
      pulseAnimation.stop();
      clearInterval(statusInterval);
    };
  }, [isVisible, scanLineAnim, pulseAnim]);

  if (!isVisible) return null;

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_HEIGHT * 0.5],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.imageContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.overlay} />

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
          <View style={[styles.dot, statusIndex > 0 && styles.dotActive]} />
          <View style={[styles.dot, statusIndex > 2 && styles.dotActive]} />
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
  imageContainer: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.5,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ACCENT_BLUE,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
