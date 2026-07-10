import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';
// StoreReview removed - Apple prohibits requesting reviews during onboarding
import Colors from '../constants/Colors';
import { useAuth } from '../hooks/useAuth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCENT_BLUE = '#7A5CFF';
const CYAN_GLOW = '#FF4D9D';
const BACKGROUND = '#FBF3E4';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#17130F';
const TEXT_SECONDARY = '#9CA3AF';
const TEXT_TERTIARY = '#6B7280';

interface OnboardingProps {
  onComplete: () => void;
}

type OnboardingStep = 'gender' | 'social' | 'referral' | 'notifications' | 'signin';

const TOTAL_STEPS = 5;

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('gender');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { signInWithGoogle, signInWithApple } = useAuth();

  const getStepIndex = (): number => {
    const steps: OnboardingStep[] = ['gender', 'social', 'referral', 'notifications', 'signin'];
    return steps.indexOf(currentStep);
  };

  const goToNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const steps: OnboardingStep[] = ['gender', 'social', 'referral', 'notifications', 'signin'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      onComplete();
    }
  };

  const handleGenderSelect = async (selected: 'male' | 'female') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGender(selected);

    // Save gender locally and to RevenueCat (if configured)
    try {
      await AsyncStorage.setItem('user_gender', selected);

      // Only save to RevenueCat if it's configured
      const isConfigured = await Purchases.isConfigured();
      if (isConfigured) {
        await Purchases.setAttributes({
          'gender': selected,
        });
      }
    } catch (error) {
      // Silently fail - don't block onboarding
      console.log('Gender will be synced later');
    }

    setTimeout(() => goToNextStep(), 300);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToNextStep();
  };

  // VIP codes that grant free Pro access
  const VIP_CODES = ['FREE2026'];

  // Save referral code to local storage and RevenueCat (if configured)
  const handleReferralContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (referralCode.trim()) {
      const code = referralCode.trim().toUpperCase();

      try {
        // Check if it's a VIP code that grants free access
        if (VIP_CODES.includes(code)) {
          await AsyncStorage.setItem('vip_access', 'true');
          await AsyncStorage.setItem('vip_code_used', code);
          console.log('VIP code activated! Free Pro access granted:', code);

          // Show success message
          Alert.alert(
            '🎉 VIP Access Activated!',
            'You now have free lifetime Pro access. Enjoy all premium features!',
            [{ text: 'Awesome!' }]
          );
        }

        // Save locally first (always works)
        await AsyncStorage.setItem('referral_code', code);
        console.log('Referral code saved locally:', code);

        // Only save to RevenueCat if it's configured
        const isConfigured = await Purchases.isConfigured();
        if (isConfigured) {
          await Purchases.setAttributes({
            'referral_code': code,
            'referred_by': code,
            'vip_access': VIP_CODES.includes(code) ? 'true' : 'false',
          });
          console.log('Referral code synced to RevenueCat');
        }
      } catch (error) {
        // Silently fail - code is saved locally, can sync later
        console.log('Referral code saved locally, will sync to RevenueCat later');
      }
    }

    goToNextStep();
  };

  const handleSocialContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Note: StoreReview removed - Apple prohibits requesting reviews during onboarding
    // Move review requests to after user has completed 2+ scans
    goToNextStep();
  };

  const handleNotifications = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        console.log('Notifications enabled');
      }
    } catch (error) {
      console.log('Notification permission error:', error);
    }
    goToNextStep();
  };

  const handleSignIn = async (provider: 'google' | 'apple') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSigningIn(true);

    try {
      if (provider === 'apple') {
        const { data, error } = await signInWithApple();
        if (data || !error) {
          // Success or user canceled (not an error)
          onComplete();
        }
      } else {
        const result = await signInWithGoogle();
        // Google auth will complete via the useEffect in useAuth
        // For now, just complete onboarding
        onComplete();
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressBar,
            {
              backgroundColor: index <= getStepIndex() ? ACCENT_BLUE : '#E7DECB',
            },
          ]}
        />
      ))}
    </View>
  );

  const renderGenderScreen = () => (
    <View style={styles.screenContainer}>
      {renderProgressBar()}
      <Text style={styles.title}>Choose gender</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.genderButton}
          onPress={() => handleGenderSelect('male')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#9B6BFF'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.genderButtonGradient}
          >
            <Text style={styles.genderButtonText}>Male</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.genderButton}
          onPress={() => handleGenderSelect('female')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#9B6BFF'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.genderButtonGradient}
          >
            <Text style={styles.genderButtonText}>Female</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSocialProofScreen = () => (
    <View style={styles.screenContainer}>
      {renderProgressBar()}
      <Text style={styles.title}>See your next haircut{'\n'}before you cut it</Text>

      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/Fadecheckailogo.png')}
          style={styles.appLogo}
          resizeMode="contain"
        />

        {/* 5 Gold Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons key={star} name="star" size={40} color="#FBBF24" />
          ))}
        </View>
      </View>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleSocialContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#9B6BFF'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReferralScreen = () => (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {renderProgressBar()}
      <Text style={styles.title}>Do you have a referral code?</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter code"
          placeholderTextColor={TEXT_TERTIARY}
          value={referralCode}
          onChangeText={setReferralCode}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Text style={styles.inputHint}>Enter your code here, or skip</Text>
      </View>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleReferralContinue}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#9B6BFF'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  const renderNotificationsScreen = () => (
    <View style={styles.screenContainer}>
      {renderProgressBar()}
      <Text style={styles.title}>Enable notifications</Text>

      <View style={styles.bellContainer}>
        <View style={styles.bellCircle}>
          <Ionicons name="notifications" size={72} color={ACCENT_BLUE} />
        </View>
      </View>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleNotifications}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#9B6BFF'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSignInScreen = () => (
    <View style={styles.screenContainer}>
      {renderProgressBar()}
      <Text style={styles.title}>Create your account</Text>

      <View style={styles.signInContainer}>
        {isSigningIn ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ACCENT_BLUE} />
            <Text style={styles.loadingText}>Signing in...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => handleSignIn('google')}
              activeOpacity={0.8}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.appleButton}
              onPress={() => handleSignIn('apple')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-apple" size={20} color="#fff" />
              <Text style={styles.appleButtonText}>Sign in with Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipSignInButton}
              onPress={onComplete}
              activeOpacity={0.8}
            >
              <Text style={styles.skipSignInText}>Continue without account</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'gender':
        return renderGenderScreen();
      case 'social':
        return renderSocialProofScreen();
      case 'referral':
        return renderReferralScreen();
      case 'notifications':
        return renderNotificationsScreen();
      case 'signin':
        return renderSignInScreen();
      default:
        return renderGenderScreen();
    }
  };

  return (
    <View style={styles.container}>
      {renderCurrentStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingTop: 100,
    gap: 6,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: 24,
    lineHeight: 40,
    letterSpacing: -1,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  genderButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  genderButtonGradient: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  skipButton: {
    alignItems: 'center',
    paddingBottom: 60,
    marginTop: -80,
  },
  skipText: {
    color: TEXT_TERTIARY,
    fontSize: 16,
    fontWeight: '500',
  },
  // Logo and stars styles
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#12121A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    marginBottom: 24,
  },
  appLogo: {
    width: 200,
    height: 200,
    borderRadius: 40,
    marginBottom: 32,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomButtonContainer: {
    paddingBottom: 60,
    marginTop: -80,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonGradient: {
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 20,
    fontSize: 16,
    color: TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  inputHint: {
    color: TEXT_TERTIARY,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  bellContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#12121A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  bellEmoji: {
    fontSize: 80,
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 68,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  appleButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    height: 68,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  skipSignInButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipSignInText: {
    color: TEXT_TERTIARY,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: TEXT_SECONDARY,
    fontSize: 16,
  },
});
