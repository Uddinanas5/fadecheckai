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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SLIDE_GAP = 16;
const SLIDE_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.38;

const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';
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

  const handleUnlock = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription plan.');
      return;
    }

    const success = await purchasePackage(selectedPackage);

    if (success) {
      onUnlock();
    }
  };

  const handleRestore = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const success = await restorePurchases();

    if (success) {
      onUnlock();
    }
  };

  // Get price string for display
  const getPriceDisplay = () => {
    if (!selectedPackage) return 'Loading...';

    const price = selectedPackage.product.priceString;
    const period = selectedPackage.packageType;

    if (period === PACKAGE_TYPE.WEEKLY) return `${price}/week`;
    if (period === PACKAGE_TYPE.MONTHLY) return `${price}/month`;
    if (period === PACKAGE_TYPE.ANNUAL) return `${price}/year`;
    if (period === PACKAGE_TYPE.LIFETIME) return `${price} forever`;

    return price;
  };

  const handleTerms = () => {
    onClose();
    setTimeout(() => router.push('/terms-of-service'), 100);
  };

  const handlePrivacy = () => {
    onClose();
    setTimeout(() => router.push('/privacy-policy'), 100);
  };

  // Card 1: Get your ratings (2x3 grid like UMAX)
  const renderRatingsCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Get your ratings</Text>

      <View style={styles.ratingsGrid}>
        {[
          { label: 'Overall', score: 8.5, color: '#22C55E' },
          { label: 'Lineup', score: 9.2, color: '#22C55E' },
          { label: 'Fade', score: 7.8, color: '#F59E0B' },
          { label: 'Blend', score: 8.1, color: '#22C55E' },
          { label: 'Shape', score: 7.5, color: '#F59E0B' },
          { label: 'Freshness', score: 9.0, color: '#22C55E' },
        ].map((item, i) => (
          <View key={i} style={styles.ratingBox}>
            <Text style={styles.ratingLabel}>{item.label}</Text>
            <Text style={styles.ratingScore}>{item.score.toFixed(1)}</Text>
            <View style={styles.ratingBarBg}>
              <View
                style={[
                  styles.ratingBar,
                  {
                    width: `${(item.score / 10) * 100}%`,
                    backgroundColor: item.color
                  }
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // Card 2: Improvement coach (chat style like UMAX)
  const renderCoachCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Improvement coach</Text>

      <View style={styles.chatContainer}>
        <View style={styles.chatBubbleAI}>
          <Text style={styles.chatTextAI}>
            What's up! I'm your personal barber coach. What are you looking to improve?
          </Text>
        </View>

        <View style={styles.chatBubbleUser}>
          <Text style={styles.chatTextUser}>How do I get a better fade?</Text>
        </View>

        <View style={styles.chatBubbleAI}>
          <Text style={styles.chatTextAI}>
            Getting a better fade starts with communication. You can start by...
          </Text>
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
          { label: 'Hair Type', value: 'Type 3B' },
          { label: 'Face Shape', value: 'Diamond' },
          { label: 'Best Styles', value: 'Mid Fade' },
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
            <Text style={styles.featureTitle}>Style for your face</Text>
            <Text style={styles.featureDesc}>You have a unique face shape... let's find your best cut!</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
        </View>
      </View>
    </View>
  );

  const slideRenderers = [
    renderRatingsCard,
    renderCoachCard,
    renderLearnCard,
    renderImprovingCard,
  ];

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
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
          <Text style={styles.headerTitle}>Unlock Everything</Text>
          <Text style={styles.headerSubtitle}>Get the full picture of your cut</Text>
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
      </View>

      {/* Bottom */}
      <View style={styles.bottomSection}>
        {/* Package Selection */}
        {packages.length > 0 && (
          <View style={styles.packageSelector}>
            {packages.map((pkg) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const isWeekly = pkg.packageType === PACKAGE_TYPE.WEEKLY;

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.packageOption,
                    isSelected && styles.packageOptionSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedPackage(pkg);
                  }}
                  activeOpacity={0.7}
                >
                  {isWeekly && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>POPULAR</Text>
                    </View>
                  )}
                  <Text style={[styles.packagePeriod, isSelected && styles.packagePeriodSelected]}>
                    {pkg.packageType === PACKAGE_TYPE.WEEKLY && 'Weekly'}
                    {pkg.packageType === PACKAGE_TYPE.MONTHLY && 'Monthly'}
                    {pkg.packageType === PACKAGE_TYPE.ANNUAL && 'Yearly'}
                    {pkg.packageType === PACKAGE_TYPE.LIFETIME && 'Lifetime'}
                  </Text>
                  <Text style={[styles.packagePrice, isSelected && styles.packagePriceSelected]}>
                    {pkg.product.priceString}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[styles.unlockButton, isPurchasing && styles.unlockButtonDisabled]}
          onPress={handleUnlock}
          activeOpacity={0.8}
          disabled={isPurchasing || isLoading}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#2563EB'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.unlockButtonGradient}
          >
            {isPurchasing ? (
              <ActivityIndicator color={TEXT_PRIMARY} />
            ) : (
              <Text style={styles.unlockButtonText}>
                {selectedPackage ? `Subscribe ${getPriceDisplay()}` : 'Loading...'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Subscription Disclosure - Required by Apple */}
        <Text style={styles.subscriptionDisclosure}>
          Payment will be charged to your Apple ID account at confirmation of purchase.
          Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
          Manage subscriptions in Settings {'>'} Apple ID {'>'} Subscriptions.
        </Text>

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={handleRestore} disabled={isPurchasing} style={styles.restoreButton}>
            <Text style={styles.restoreLink}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={handleTerms}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>·</Text>
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
  ratingsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'center',
    gap: 10,
  },
  ratingBox: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  ratingScore: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  ratingBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  ratingBar: {
    height: '100%',
    borderRadius: 2,
  },

  // Card 2: Chat
  chatContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
  },
  chatBubbleAI: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
    maxWidth: '90%',
  },
  chatTextAI: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    lineHeight: 18,
  },
  chatBubbleUser: {
    backgroundColor: ACCENT_BLUE,
    borderRadius: 16,
    borderTopRightRadius: 4,
    padding: 12,
    alignSelf: 'flex-end',
    maxWidth: '75%',
  },
  chatTextUser: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    lineHeight: 18,
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

  // Bottom
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  packageSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  packageOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  packageOptionSelected: {
    borderColor: ACCENT_BLUE,
    backgroundColor: 'rgba(1, 69, 242, 0.1)',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: ACCENT_BLUE,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: 0.5,
  },
  packagePeriod: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  packagePeriodSelected: {
    color: TEXT_PRIMARY,
  },
  packagePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  packagePriceSelected: {
    color: ACCENT_BLUE,
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
  subscriptionDisclosure: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  restoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  restoreLink: {
    fontSize: 14,
    color: ACCENT_BLUE,
    fontWeight: '600',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  legalLink: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
});
