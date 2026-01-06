import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';
const BACKGROUND = '#0A0A0F';
const CARD_BG = '#1A1A24';
const TEXT_PRIMARY = '#EDF1F5';
const TEXT_SECONDARY = '#9CA3AF';

interface BeginScanProps {
  onBeginScan: () => void;
}

export default function BeginScan({ onBeginScan }: BeginScanProps) {
  const handleBeginScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBeginScan();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Haircut Analysis</Text>
        <TouchableOpacity style={styles.settingsButton} activeOpacity={0.6}>
          <Ionicons name="settings-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Image with scan overlay */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            {/* Scan grid overlay */}
            <View style={styles.scanOverlay}>
              {/* Vertical lines */}
              <View style={[styles.scanLine, styles.verticalLine, { left: '25%' }]} />
              <View style={[styles.scanLine, styles.verticalLine, { left: '50%' }]} />
              <View style={[styles.scanLine, styles.verticalLine, { left: '75%' }]} />
              {/* Horizontal lines */}
              <View style={[styles.scanLine, styles.horizontalLine, { top: '25%' }]} />
              <View style={[styles.scanLine, styles.horizontalLine, { top: '50%' }]} />
              <View style={[styles.scanLine, styles.horizontalLine, { top: '75%' }]} />
              {/* Corner brackets */}
              <View style={[styles.cornerBracket, styles.topLeft]} />
              <View style={[styles.cornerBracket, styles.topRight]} />
              <View style={[styles.cornerBracket, styles.bottomLeft]} />
              <View style={[styles.cornerBracket, styles.bottomRight]} />
            </View>
            {/* Placeholder icon */}
            <Ionicons name="cut" size={60} color="rgba(1, 69, 242, 0.4)" />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.mainText}>Get your ratings and{'\n'}recommendations</Text>

        {/* Pagination dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* Begin Scan Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.beginButton}
          onPress={handleBeginScan}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#2563EB'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.beginButtonText}>Begin scan</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -1,
  },
  settingsButton: {
    padding: 8,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: CARD_BG,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  scanLine: {
    position: 'absolute',
    backgroundColor: ACCENT_BLUE,
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  horizontalLine: {
    height: 1,
    width: '100%',
  },
  cornerBracket: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: CYAN_GLOW,
  },
  topLeft: {
    top: 20,
    left: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 2,
  },
  topRight: {
    top: 20,
    right: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 2,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 2,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 2,
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
    paddingBottom: 50,
  },
  beginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beginButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
});
