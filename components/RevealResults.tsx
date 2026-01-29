import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
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

interface RevealResultsProps {
  imageUri: string;
  onGetPro: () => void;
  onInviteFriends: () => void;
}

export default function RevealResults({ imageUri, onGetPro, onInviteFriends }: RevealResultsProps) {
  const handleGetPro = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGetPro();
  };

  const handleInvite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onInviteFriends();
  };

  const ScoreCard = ({ label, blurred = true }: { label: string; blurred?: boolean }) => (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreBarContainer}>
        <View style={styles.scoreBarBackground}>
          {blurred && (
            <LinearGradient
              colors={[ACCENT_BLUE, CYAN_GLOW] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.scoreBarFill, { width: '70%' }]}
            />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.eyeIconContainer}>
          <Ionicons name="eye-outline" size={28} color={ACCENT_BLUE} />
        </View>
        <Text style={styles.title}>Your coaching awaits</Text>
        <Text style={styles.subtitle}>
          Invite 3 friends or get FadeCheck Pro to view your grooming tips
        </Text>
      </View>

      {/* Photo */}
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.photo}
          resizeMode="cover"
        />
      </View>

      {/* Blurred Scores Card */}
      <View style={styles.scoresContainer}>
        <View style={styles.scoresCard}>
          {/* Top row - larger cards */}
          <View style={styles.scoresRow}>
            <View style={styles.scoreCardLarge}>
              <ScoreCard label="Quality" />
            </View>
            <View style={styles.scoreCardLarge}>
              <ScoreCard label="Tips" />
            </View>
          </View>

          {/* Middle row */}
          <View style={styles.scoresRow}>
            <View style={styles.scoreCardMedium}>
              <ScoreCard label="Lineup" />
            </View>
            <View style={styles.scoreCardMedium}>
              <ScoreCard label="Fade" />
            </View>
          </View>

          {/* Bottom row */}
          <View style={styles.scoresRow}>
            <View style={styles.scoreCardMedium}>
              <ScoreCard label="Blend" />
            </View>
            <View style={styles.scoreCardMedium}>
              <ScoreCard label="Freshness" />
            </View>
          </View>

          {/* Blur overlay */}
          <View style={styles.blurOverlay}>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={26} color={ACCENT_BLUE} />
            </View>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.proButton}
          onPress={handleGetPro}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[ACCENT_BLUE, '#2563EB'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.proButtonGradient}
          >
            <Ionicons name="flash" size={20} color={TEXT_PRIMARY} />
            <Text style={styles.proButtonText}>Get FadeCheck Pro</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inviteButton}
          onPress={handleInvite}
          activeOpacity={0.8}
        >
          <Text style={styles.inviteButtonText}>Invite 3 Friends</Text>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  eyeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(1, 69, 242, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: ACCENT_BLUE,
  },
  scoresContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scoresCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  scoreCardLarge: {
    flex: 1,
  },
  scoreCardMedium: {
    flex: 1,
  },
  scoreCard: {
    backgroundColor: '#252530',
    borderRadius: 16,
    padding: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  scoreBarContainer: {
    height: 6,
  },
  scoreBarBackground: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  lockIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(1, 69, 242, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(1, 69, 242, 0.3)',
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    gap: 12,
  },
  proButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ACCENT_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  proButtonGradient: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  proButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  inviteButton: {
    backgroundColor: CARD_BG,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  inviteButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
});
