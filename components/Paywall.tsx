import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';
const BACKGROUND = '#0A0A0F';
const CARD_BG = '#1A1A24';
const TEXT_PRIMARY = '#EDF1F5';
const TEXT_SECONDARY = '#9CA3AF';
const TEXT_TERTIARY = '#6B7280';

interface PaywallProps {
  onClose: () => void;
  onUnlock: () => void;
}

interface ScoreCardData {
  label: string;
  score: number;
  color: readonly [string, string];
}

const SAMPLE_SCORES: ScoreCardData[] = [
  { label: 'Overall', score: 68, color: ['#F59E0B', '#EF4444'] as const },
  { label: 'Potential', score: 91, color: [ACCENT_BLUE, CYAN_GLOW] as const },
  { label: 'Lineup', score: 56, color: ['#F59E0B', '#EF4444'] as const },
  { label: 'Fade', score: 81, color: ['#22C55E', '#10B981'] as const },
  { label: 'Blend', score: 65, color: ['#F59E0B', '#EF4444'] as const },
  { label: 'Freshness', score: 76, color: ['#22C55E', '#10B981'] as const },
];

export default function Paywall({ onClose, onUnlock }: PaywallProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 48));
    setCurrentSlide(slideIndex);
  };

  const handleUnlock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Integrate RevenueCat
    Alert.alert(
      'FadeCheck Pro',
      'Subscription will be available soon!\n\nFor now, enjoy all features for free.',
      [{ text: 'Continue', onPress: onUnlock }]
    );
  };

  const renderScoreCard = (item: ScoreCardData) => (
    <View key={item.label} style={styles.scoreCard}>
      <Text style={styles.scoreLabel}>{item.label}</Text>
      <Text style={styles.scoreValue}>{item.score}</Text>
      <View style={styles.scoreBarBg}>
        <LinearGradient
          colors={item.color}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.scoreBar, { width: `${item.score}%` }]}
        />
      </View>
    </View>
  );

  // Slide 1: Get your ratings (UMAX style)
  const renderSlide1 = () => (
    <View style={styles.slideContent}>
      <Text style={styles.slideTitle}>Get your ratings</Text>
      <View style={styles.scoresGrid}>
        <View style={styles.scoresRow}>
          {SAMPLE_SCORES.slice(0, 3).map(renderScoreCard)}
        </View>
        <View style={styles.scoresRow}>
          {SAMPLE_SCORES.slice(3, 6).map(renderScoreCard)}
        </View>
      </View>
    </View>
  );

  // Slide 2: Improvement coach (UMAX chat style)
  const renderSlide2 = () => (
    <View style={styles.slideContent}>
      <Text style={styles.slideTitle}>Improvement coach</Text>
      <View style={styles.chatContainer}>
        <View style={styles.chatBubbleLeft}>
          <Text style={styles.chatText}>
            What's up! I'm your personal barber coach. What are you looking to learn?
          </Text>
        </View>
        <View style={styles.chatBubbleRight}>
          <Text style={styles.chatTextUser}>How do I get a better fade?</Text>
        </View>
        <View style={styles.chatBubbleLeft}>
          <Text style={styles.chatText}>
            Getting a better fade includes a few different steps. You can start by...
          </Text>
        </View>
      </View>
    </View>
  );

  // Slide 3: Learn about your cut (UMAX attributes style)
  const renderSlide3 = () => (
    <View style={styles.slideContent}>
      <Text style={styles.slideTitle}>Learn about your cut</Text>
      <View style={styles.attributesContainer}>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Fade Type</Text>
          <Text style={styles.attributeValue}>Mid Skin Fade</Text>
        </View>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Shape</Text>
          <Text style={styles.attributeValue}>Round</Text>
        </View>
        <View style={styles.attributeRow}>
          <Text style={styles.attributeLabel}>Freshness</Text>
          <Text style={styles.attributeValue}>3 days old</Text>
        </View>
      </View>
    </View>
  );

  // Slide 4: Start improving (UMAX tips style)
  const renderSlide4 = () => (
    <View style={styles.slideContent}>
      <Text style={styles.slideTitle}>Start improving</Text>
      <View style={styles.tipsContainer}>
        <TouchableOpacity style={styles.tipCard} activeOpacity={0.7}>
          <View style={[styles.tipIconContainer, { backgroundColor: 'rgba(1, 69, 242, 0.15)' }]}>
            <Ionicons name="cut" size={20} color={ACCENT_BLUE} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Find a better barber</Text>
            <Text style={styles.tipDescription}>
              Your current cut has visible lines. Tap to find top-rated barbers near you.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={ACCENT_BLUE} style={{ opacity: 0.6 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.tipCard} activeOpacity={0.7}>
          <View style={[styles.tipIconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            <Ionicons name="sparkles" size={20} color={CYAN_GLOW} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Maintenance tips</Text>
            <Text style={styles.tipDescription}>
              Learn how to maintain your fade between cuts.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={CYAN_GLOW} style={{ opacity: 0.6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
      </TouchableOpacity>

      {/* Header with gradient */}
      <View style={styles.header}>
        <LinearGradient
          colors={[ACCENT_BLUE, CYAN_GLOW] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradientBg}
        >
          <Text style={styles.levelUpText}>LEVEL UP</Text>
        </LinearGradient>
        <Text style={styles.subtitle}>Proven to help you level up your cut.</Text>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false, listener: handleScroll }
        )}
        scrollEventThrottle={16}
        style={styles.slidesContainer}
        contentContainerStyle={styles.slidesContent}
      >
        <View style={styles.slide}>{renderSlide1()}</View>
        <View style={styles.slide}>{renderSlide2()}</View>
        <View style={styles.slide}>{renderSlide3()}</View>
        <View style={styles.slide}>{renderSlide4()}</View>
      </ScrollView>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: currentSlide === index ? ACCENT_BLUE : '#252530',
                width: currentSlide === index ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Social Proof */}
      <View style={styles.socialProofContainer}>
        <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
        <Text style={styles.socialProof}>100,000+ haircuts rated</Text>
      </View>

      {/* Unlock Button */}
      <TouchableOpacity
        style={styles.unlockButton}
        onPress={handleUnlock}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[ACCENT_BLUE, '#2563EB'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.unlockButtonGradient}
        >
          <Text style={styles.unlockButtonText}>Unlock Now</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Price */}
      <Text style={styles.priceText}>$4.99 per week</Text>

      {/* Footer Links */}
      <View style={styles.footerLinks}>
        <TouchableOpacity>
          <Text style={styles.footerLink}>Terms of Use</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.footerLink}>Restore Purchase</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.footerLink}>Privacy Policy</Text>
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
  closeButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 16,
  },
  headerGradientBg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  levelUpText: {
    fontSize: 42,
    fontWeight: '800',
    fontStyle: 'italic',
    color: TEXT_PRIMARY,
    letterSpacing: 2,
    textShadowColor: 'rgba(1, 69, 242, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 10,
  },
  slidesContainer: {
    flex: 1,
  },
  slidesContent: {
    paddingHorizontal: 24,
  },
  slide: {
    width: SCREEN_WIDTH - 48,
  },
  slideContent: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 20,
    minHeight: 300,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  // Scores grid (Slide 1)
  scoresGrid: {
    gap: 12,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#252530',
    borderRadius: 16,
    padding: 12,
  },
  scoreLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    letterSpacing: -1,
  },
  scoreBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
    borderRadius: 2,
  },
  // Chat container (Slide 2)
  chatContainer: {
    gap: 12,
  },
  chatBubbleLeft: {
    backgroundColor: '#252530',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 14,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  chatBubbleRight: {
    backgroundColor: ACCENT_BLUE,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 14,
    maxWidth: '85%',
    alignSelf: 'flex-end',
  },
  chatText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  chatTextUser: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    lineHeight: 20,
  },
  // Attributes container (Slide 3)
  attributesContainer: {
    gap: 12,
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252530',
    borderRadius: 16,
    padding: 16,
  },
  attributeLabel: {
    fontSize: 15,
    color: TEXT_SECONDARY,
  },
  attributeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  // Tips container (Slide 4)
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252530',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
  // Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  socialProofContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  socialProof: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  unlockButton: {
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  unlockButtonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  priceText: {
    textAlign: 'center',
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginTop: 12,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    marginBottom: 40,
  },
  footerLink: {
    fontSize: 12,
    color: TEXT_TERTIARY,
  },
});
