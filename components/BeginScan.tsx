import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = SCREEN_WIDTH * 0.82;

// Design System Colors
const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';
const BACKGROUND = '#0A0A0F';
const CARD_BG = '#1A1A24';
const TEXT_PRIMARY = '#EDF1F5';

interface BeginScanProps {
  onBeginScan: () => void;
}

// Floating Particle Component
const FloatingParticle = ({ delay, startX }: { delay: number; startX: number }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(IMAGE_SIZE + 20);
      opacity.setValue(0);
      translateX.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -20,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 1900,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(translateX, {
            toValue: (Math.random() - 0.5) * 40,
            duration: 3500,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          transform: [{ translateY }, { translateX }],
          opacity,
        },
      ]}
    />
  );
};

// Animated Score Badge Component
const ScoreBadge = ({
  score,
  label,
  position,
  delay
}: {
  score: string;
  label: string;
  position: { top?: number; bottom?: number; left?: number; right?: number };
  delay: number;
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in animation
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Floating animation
    const float = () => {
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -6,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => float());
    };

    setTimeout(float, delay);
  }, []);

  return (
    <Animated.View
      style={[
        styles.scoreBadge,
        position,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <Text style={styles.scoreBadgeScore}>{score}</Text>
      <Text style={styles.scoreBadgeLabel}>{label}</Text>
    </Animated.View>
  );
};

// Animated Corner Bracket Component
const AnimatedCornerBracket = ({
  style,
  delay
}: {
  style: any;
  delay: number;
}) => {
  const opacity = useRef(new Animated.Value(0.6)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

export default function BeginScan({ onBeginScan }: BeginScanProps) {
  // Animation refs
  const scanLinePosition = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.95)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const buttonGlow = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Hero image entrance animation
    Animated.parallel([
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Scan line animation (continuous loop)
    const animateScanLine = () => {
      scanLinePosition.setValue(0);
      Animated.timing(scanLinePosition, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      }).start(() => animateScanLine());
    };
    animateScanLine();

    // Button glow pulse animation
    const pulseButton = () => {
      Animated.sequence([
        Animated.timing(buttonGlow, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonGlow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start(() => pulseButton());
    };
    pulseButton();

    // Background glow pulse
    const pulseGlow = () => {
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => pulseGlow());
    };
    pulseGlow();
  }, []);

  const handleBeginScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBeginScan();
  };

  // Scan line interpolation
  const scanLineTranslateY = scanLinePosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, IMAGE_SIZE],
  });

  // Generate particle positions
  const particles = [
    { delay: 0, startX: IMAGE_SIZE * 0.15 },
    { delay: 400, startX: IMAGE_SIZE * 0.35 },
    { delay: 800, startX: IMAGE_SIZE * 0.55 },
    { delay: 1200, startX: IMAGE_SIZE * 0.75 },
    { delay: 1600, startX: IMAGE_SIZE * 0.25 },
    { delay: 2000, startX: IMAGE_SIZE * 0.65 },
    { delay: 2400, startX: IMAGE_SIZE * 0.45 },
    { delay: 2800, startX: IMAGE_SIZE * 0.85 },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Haircut Analysis</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Background Glow - centered on screen */}
        <Animated.View style={[styles.backgroundGlow, { opacity: glowOpacity }]} />

        {/* Image Container with Hero */}
        <View style={styles.imageWrapper}>
          {/* Image Container with Hero */}
          <Animated.View
            style={[
              styles.imageContainer,
              {
                transform: [{ scale: imageScale }],
                opacity: imageOpacity,
              },
            ]}
          >
            {/* Floating Particles */}
            <View style={styles.particlesContainer}>
              {particles.map((particle, index) => (
                <FloatingParticle key={index} delay={particle.delay} startX={particle.startX} />
              ))}
            </View>

            {/* Hero Image */}
            <View style={styles.heroImageWrapper}>
              <Image
                source={require('../assets/images/Beginscanpicture.png')}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>

            {/* Animated Scan Line */}
            <Animated.View
              style={[
                styles.scanLineAnimated,
                {
                  transform: [{ translateY: scanLineTranslateY }],
                },
              ]}
            >
              <LinearGradient
                colors={['transparent', CYAN_GLOW, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scanLineGradient}
              />
            </Animated.View>

            {/* Animated Corner Brackets */}
            <AnimatedCornerBracket
              style={[styles.cornerBracket, styles.topLeft]}
              delay={0}
            />
            <AnimatedCornerBracket
              style={[styles.cornerBracket, styles.topRight]}
              delay={250}
            />
            <AnimatedCornerBracket
              style={[styles.cornerBracket, styles.bottomLeft]}
              delay={500}
            />
            <AnimatedCornerBracket
              style={[styles.cornerBracket, styles.bottomRight]}
              delay={750}
            />

            {/* Floating Score Badges */}
            <ScoreBadge
              score="9.5"
              label="PERFECT"
              position={{ top: 50, right: -15 }}
              delay={1000}
            />
            <ScoreBadge
              score="8.9"
              label="SHARP"
              position={{ bottom: 70, left: -10 }}
              delay={1400}
            />
          </Animated.View>
        </View>

        {/* Text */}
        <Text style={styles.mainText}>
          Get your analysis and{'\n'}grooming tips
        </Text>

        {/* Pagination dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Begin Scan Button */}
      <View style={styles.buttonContainer}>
        <Animated.View style={{ transform: [{ scale: buttonGlow }] }}>
          <TouchableOpacity
            style={styles.beginButton}
            onPress={handleBeginScan}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[ACCENT_BLUE, '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.beginButtonText}>Begin scan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginBottom: 36,
  },
  backgroundGlow: {
    position: 'absolute',
    width: IMAGE_SIZE * 1.34,
    height: IMAGE_SIZE * 1.34,
    borderRadius: IMAGE_SIZE * 0.67,
    backgroundColor: ACCENT_BLUE,
    opacity: 0.3,
    top: '50%',
    left: '50%',
    marginTop: -(IMAGE_SIZE * 1.34) / 2 - 70,
    marginLeft: -(IMAGE_SIZE * 1.34) / 2 + 20,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 28,
    overflow: 'visible',
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    shadowColor: CYAN_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'visible',
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CYAN_GLOW,
    shadowColor: CYAN_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  heroImageWrapper: {
    flex: 1,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: CARD_BG,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  scanLineAnimated: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    zIndex: 5,
  },
  scanLineGradient: {
    flex: 1,
    shadowColor: CYAN_GLOW,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  cornerBracket: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: CYAN_GLOW,
    zIndex: 15,
  },
  topLeft: {
    top: 16,
    left: 16,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 16,
    right: 16,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 4,
  },
  scoreBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(26, 26, 36, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    alignItems: 'center',
    zIndex: 20,
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scoreBadgeScore: {
    fontSize: 18,
    fontWeight: '700',
    color: CYAN_GLOW,
  },
  scoreBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
    marginTop: 2,
  },
  mainText: {
    fontSize: 24,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 30,
    letterSpacing: -0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#252530',
  },
  dotActive: {
    backgroundColor: ACCENT_BLUE,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    marginTop: -80,
  },
  beginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beginButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
