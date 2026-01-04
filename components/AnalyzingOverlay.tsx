import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import Colors from '../constants/Colors';

interface AnalyzingOverlayProps {
  imageUri: string;
  isVisible: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const STATUS_MESSAGES = [
  'Checking that lineup...',
  'Analyzing the fade...',
  'Rating the blend...',
  'Evaluating the shape...',
  'Almost done...',
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

        {/* Scan line */}
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: scanLineTranslateY }] },
          ]}
        />
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
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.accent.primary,
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
    height: 3,
    backgroundColor: Colors.accent.primary,
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  statusContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background.tertiary,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.accent.primary,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text.primary,
  },
});
