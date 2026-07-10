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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRevenueCat } from '../contexts/RevenueCatContext';
import { PurchasesPackage, PACKAGE_TYPE } from 'react-native-purchases';
import { scheduleAbandonedPaywallNotification, cancelAbandonedPaywallNotification } from '../utils/notifications';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_GAP = 16;
const SLIDE_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.38;

const ACCENT_BLUE = '#7A5CFF';
const CYAN_GLOW = '#FF4D9D';
const BACKGROUND = '#0A0A0F';
const CARD_BG = '#111118';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#8E8E93';

interface PaywallProps {
  onClose: () => void;
  onUnlock: () => void;
}

export default function Paywall({ onClose, onUnlock }: PaywallProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const {
    packages,
    isPurchasing,
    isLoading,
    purchasePackage,
    restorePurchases,
  } = useRevenueCat();

  // Select weekly by default if available
  React.useEffect(() => {
    if (packages.length > 0 && !selectedPackage) {
      // Try to find weekly, otherwise use first package
      const weeklyPkg = packages.find(p => p.packageType === PACKAGE_TYPE.WEEKLY);
      setSelectedPackage(weeklyPkg || packages[0]);
    }
  }, [packages]);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / (SLIDE_WIDTH + SLIDE_GAP));
    setCurrentSlide(slideIndex);
  };

  // Handle close - schedule abandoned paywall notification
  const handleClose = async () => {
    // Schedule notification for users who didn't purchase
    await scheduleAbandonedPaywallNotification();
    onClose();
  };

  const handleUnlock = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription plan.');
      return;
    }

    const success = await purchasePackage(selectedPackage);

    if (success) {
      // Cancel any scheduled abandoned paywall notification
      await cancelAbandonedPaywallNotification();
      onUnlock();
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const success = await restorePurchases();

    if (success) {
      // Cancel any scheduled abandoned paywall notification
      await cancelAbandonedPaywallNotification();
      onUnlock();
    }
  };

  // Get price string for display
  const getPriceDisplay = () => {
    if (!selectedPackage) return 'Loading...';

    const price = selectedPackage.product.priceString;
    return `${price} per week`;
  };

  const handleTerms = () => {
    onClose();
    setTimeout(() => router.push('/terms-of-service'), 100);
  };

  const handlePrivacy = () => {
    onClose();
    setTimeout(() => router.push('/privacy-policy'), 100);
  };

  // Card 1: Get your coaching (2x3 grid)
  const renderFeedbackCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Get detailed feedback</Text>

      <View style={styles.feedbackGrid}>
        {[
          { label: 'Quality', icon: '✨' },
          { label: 'Lineup', icon: '📐' },
          { label: 'Fade', icon: '🎨' },
          { label: 'Blend', icon: '✂️' },
          { label: 'Style', icon: '💈' },
          { label: 'Freshness', icon: '🌟' },
        ].map((item, i) => (
          <View key={i} style={styles.feedbackBox}>
            <Text style={styles.feedbackLabel}>{item.label}</Text>
            <Text style={styles.feedbackIcon}>{item.icon}</Text>
            <View style={styles.feedbackBarBg}>
              <LinearGradient
                colors={[ACCENT_BLUE, CYAN_GLOW] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.feedbackBar, { width: '75%' }]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // Card 2: Track your journey
  const renderProgressCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Track your journey</Text>

      <View style={styles.progressContainer}>
        {[
          { date: 'Jan 5', level: 40, label: 'Growing' },
          { date: 'Jan 19', level: 60, label: 'Fresh' },
          { date: 'Feb 2', level: 75, label: 'Clean' },
          { date: 'Feb 16', level: 90, label: 'Sharp' },
        ].map((item, i) => (
          <View key={i} style={styles.progressRow}>
            <Text style={styles.progressDate}>{item.date}</Text>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={[ACCENT_BLUE, CYAN_GLOW] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${item.level}%` }]}
              />
            </View>
            <Text style={[styles.progressScore, { color: '#22C55E' }]}>
              {item.label}
            </Text>
          </View>
        ))}
        <View style={styles.progressFooter}>
          <Ionicons name="trending-up" size={16} color="#22C55E" />
          <Text style={styles.progressFooterText}>See your growth!</Text>
        </View>
      </View>
    </View>
  );

  // Card 3: Learn about yourself (attribute rows like UMAX)
  const renderLearnCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Learn about yourself</Text>

      <View style={styles.attributeList}>
        {[
          { label: 'Hair Texture', value: 'Coarse' },
          { label: 'Hair Density', value: 'Thick' },
          { label: 'Best Fade', value: 'Mid Taper' },
        ].map((item, i) => (
          <View key={i} style={styles.attributeRow}>
            <Text style={styles.attributeLabel}>{item.label}</Text>
            <Text style={styles.attributeValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Card 4: Start improving (feature rows like UMAX)
  const renderImprovingCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Start improving</Text>

      <View style={styles.featureList}>
        <View style={styles.featureRow}>
          <View style={[styles.featureIcon, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
            <Text style={{ fontSize: 18 }}>✂️</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Talk to your barber</Text>
            <Text style={styles.featureDesc}>Get personalized tips on what to ask for next visit.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
        </View>

        <View style={styles.featureRow}>
          <View style={[styles.featureIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
            <Text style={{ fontSize: 18 }}>💎</Text>
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Discover new styles</Text>
            <Text style={styles.featureDesc}>Get personalized style ideas that complement your look!</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
        </View>
      </View>
    </View>
  );

  const slideRenderers = [
    renderFeedbackCard,
    renderProgressCard,
    renderLearnCard,
    renderImprovingCard,
  ];

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClose}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={22} color={TEXT_SECONDARY} />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[ACCENT_BLUE, CYAN_GLOW] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.proBadge}
          >
            <Text style={styles.proBadgeText}>PRO</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>Unlock Your Coach</Text>
          <Text style={styles.headerSubtitle}>Get personalized grooming tips & feedback</Text>
        </View>

        {/* Slides */}
        <View style={styles.slidesWrapper}>
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
            contentContainerStyle={styles.slidesContent}
            decelerationRate="fast"
            snapToInterval={SLIDE_WIDTH + SLIDE_GAP}
          >
            {slideRenderers.map((render, index) => (
              <View key={index} style={styles.slide}>
                {render()}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slideRenderers.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentSlide === index && styles.dotActive]}
            />
          ))}
        </View>

        {/* Users count */}
        <Text style={styles.scansText}>10,000+ users improving their style</Text>
      </View>

      {/* Bottom */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.unlockButton, isPurchasing && styles.unlockButtonDisabled]}
          onPress={handleUnlock}
          activeOpacity={0.8}
          disabled={isPurchasing || isLoading}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#9B6BFF'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.unlockButtonGradient}
          >
            {isPurchasing ? (
              <ActivityIndicator color={TEXT_PRIMARY} />
            ) : (
              <Text style={styles.unlockButtonText}>Unlock now 🙌</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Price below button */}
        <Text style={styles.priceText}>{getPriceDisplay()}</Text>

        {/* Apple Required Subscription Disclosure */}
        <Text style={styles.subscriptionDisclosure}>
          Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless canceled at least 24 hours before the end of the current period. Manage subscriptions in Account Settings.
        </Text>

        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={handleTerms}>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
            <Text style={styles.legalLink}>Restore Purchase</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrivacy}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingTop: 54,
  },
  closeButton: {
    position: 'absolute',
    top: 54,
    left: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 28,
  },
  proBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 12,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  slidesWrapper: {
    flex: 1,
  },
  slidesContent: {
    paddingHorizontal: 24,
  },
  slide: {
    width: SLIDE_WIDTH,
    marginRight: SLIDE_GAP,
  },
  card: {
    height: CARD_HEIGHT,
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 20,
  },

  // Card 1: Ratings Grid
  feedbackGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'center',
    gap: 10,
  },
  feedbackBox: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  feedbackLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  feedbackIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  feedbackBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  feedbackBar: {
    height: '100%',
    borderRadius: 2,
  },

  // Card 2: Progress
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressDate: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    width: 50,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressScore: {
    fontSize: 11,
    fontWeight: '600',
    width: 55,
    textAlign: 'right',
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFooterText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
  },

  // Card 3: Attributes
  attributeList: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  attributeLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  attributeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },

  // Card 4: Features
  featureList: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 16,
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dotActive: {
    width: 24,
    backgroundColor: ACCENT_BLUE,
  },
  scansText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  unlockButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  unlockButtonDisabled: {
    opacity: 0.7,
  },
  unlockButtonGradient: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 19,
    fontWeight: '700',
  },
  priceText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  subscriptionDisclosure: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 12,
    paddingHorizontal: 8,
    opacity: 0.7,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginTop: 8,
    marginBottom: 8,
  },
  legalLink: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
});
