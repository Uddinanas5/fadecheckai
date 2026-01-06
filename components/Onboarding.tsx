import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import Colors from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';
const BACKGROUND = '#0A0A0F';
const CARD_BG = '#1A1A24';
const TEXT_PRIMARY = '#EDF1F5';
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

  const handleGenderSelect = (selected: 'male' | 'female') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGender(selected);
    setTimeout(() => goToNextStep(), 300);
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const handleSignIn = (provider: 'google' | 'apple') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement actual sign-in
    Alert.alert('Coming Soon', `${provider === 'google' ? 'Google' : 'Apple'} sign-in will be available soon!`);
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressBar,
            {
              backgroundColor: index <= getStepIndex() ? ACCENT_BLUE : '#252530',
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
            colors={[ACCENT_BLUE, '#2563EB'] as const}
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
            colors={[ACCENT_BLUE, '#2563EB'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.genderButtonGradient}
          >
            <Text style={styles.genderButtonText}>Female</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>skip</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSocialProofScreen = () => (
    <View style={styles.screenContainer}>
      {renderProgressBar()}
      <Text style={styles.title}>Trusted by 100,000+{'\n'}people</Text>

      {/* App Store Rating Card */}
      <View style={styles.ratingCardContainer}>
        <View style={styles.ratingCard}>
          <View style={styles.appIconContainer}>
            <Ionicons name="cut" size={28} color={ACCENT_BLUE} />
          </View>
          <Text style={styles.ratingTitle}>Enjoying FadeCheck?</Text>
          <Text style={styles.ratingSubtitle}>Tap a star to rate it on the{'\n'}App Store.</Text>
          <View style={styles.ratingStarsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name="star-outline" size={28} color={CYAN_GLOW} />
            ))}
          </View>
          <TouchableOpacity style={styles.notNowButton}>
            <Text style={styles.notNowText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Big Stars */}
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons key={star} name="star" size={36} color="#FBBF24" />
        ))}
      </View>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={goToNextStep}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#2563EB'] as const}
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
          onPress={goToNextStep}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#2563EB'] as const}
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
            colors={[ACCENT_BLUE, '#2563EB'] as const}
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

        {/* Skip button for testing - REMOVE BEFORE APP STORE */}
        <TouchableOpacity
          style={styles.skipSignInButton}
          onPress={onComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.skipSignInText}>skip</Text>
        </TouchableOpacity>
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
    paddingTop: 60,
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
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  skipButton: {
    alignItems: 'center',
    paddingBottom: 50,
  },
  skipText: {
    color: TEXT_TERTIARY,
    fontSize: 16,
    fontWeight: '500',
  },
  // Rating card styles
  ratingCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  appIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(1, 69, 242, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    fontSize: 32,
  },
  ratingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  ratingStar: {
    fontSize: 28,
    color: CYAN_GLOW,
  },
  notNowButton: {
    paddingVertical: 8,
  },
  notNowText: {
    fontSize: 15,
    color: CYAN_GLOW,
    fontWeight: '500',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 20,
    gap: 8,
  },
  star: {
    fontSize: 40,
  },
  bottomButtonContainer: {
    paddingBottom: 50,
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
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '600',
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
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  appleButton: {
    flexDirection: 'row',
    backgroundColor: '#000',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  skipSignInButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  skipSignInText: {
    color: TEXT_TERTIARY,
    fontSize: 16,
    fontWeight: '500',
  },
});
