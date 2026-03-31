import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { AnalysisResult } from '../types';
import { getScoreColor } from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';
const CARD_BG = '#0D0D12';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#8B8B9E';

interface ShareCardProps {
  imageUri: string;
  result: AnalysisResult;
  variant?: 'instagram-story' | 'instagram-post' | 'tiktok' | 'compact';
}

export default function ShareCard({ imageUri, result, variant = 'instagram-post' }: ShareCardProps) {
  const viewShotRef = useRef<ViewShot>(null);

  const getCardDimensions = () => {
    switch (variant) {
      case 'instagram-story':
        return { width: 1080, height: 1920, aspectRatio: 9 / 16 };
      case 'instagram-post':
        return { width: 1080, height: 1080, aspectRatio: 1 };
      case 'tiktok':
        return { width: 1080, height: 1920, aspectRatio: 9 / 16 };
      case 'compact':
        return { width: 600, height: 600, aspectRatio: 1 };
      default:
        return { width: 1080, height: 1080, aspectRatio: 1 };
    }
  };

  const dimensions = getCardDimensions();
  const scoreColor = result.overall_score ? getScoreColor(result.overall_score) : CYAN_GLOW;

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share your FadeCheck score',
          });
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device.');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  const renderInstagramStory = () => (
    <View style={[styles.storyContainer, { aspectRatio: dimensions.aspectRatio }]}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.storyHeader}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>FADE</Text>
          <Text style={[styles.logoText, { color: CYAN_GLOW }]}>CHECK</Text>
        </View>
        <Text style={styles.tagline}>AI-Powered Haircut Analysis</Text>
      </View>

      {/* Main Image */}
      <View style={styles.storyImageContainer}>
        <Image source={{ uri: imageUri }} style={styles.storyImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.imageOverlay}
        />
      </View>

      {/* Score Display */}
      <View style={styles.scoreSection}>
        <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {result.overall_score?.toFixed(1) || '--'}
          </Text>
          <Text style={styles.scoreOutOf}>/10</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: scoreColor }]}>
          {result.score_label || 'ANALYZING'}
        </Text>
      </View>

      {/* Stats Grid */}
      {result.scores && (
        <View style={styles.statsGrid}>
          {Object.entries(result.scores).map(([key, value]) => (
            <View key={key} style={styles.statItem}>
              <Text style={styles.statValue}>{value.toFixed(1)}</Text>
              <Text style={styles.statLabel}>{key.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Hair Profile */}
      {result.hair_profile && (
        <View style={styles.profileBadge}>
          <Text style={styles.profileText}>
            {result.hair_profile.hair_type_name} • {result.face_analysis?.face_shape || 'Unknown'} Face
          </Text>
        </View>
      )}

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <Text style={styles.ctaText}>Get your score at</Text>
        <Text style={styles.ctaLink}>fadecheck.app</Text>
      </View>
    </View>
  );

  const renderInstagramPost = () => (
    <View style={[styles.postContainer, { aspectRatio: dimensions.aspectRatio }]}>
      <LinearGradient
        colors={['#0A0A0F', '#0D0D15']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Section with Image */}
      <View style={styles.postImageSection}>
        <Image source={{ uri: imageUri }} style={styles.postImage} />
        <LinearGradient
          colors={['transparent', 'rgba(10,10,15,1)']}
          style={styles.postImageGradient}
        />
        
        {/* Score Overlay */}
        <View style={styles.postScoreOverlay}>
          <View style={[styles.postScoreBadge, { backgroundColor: scoreColor }]}>
            <Text style={styles.postScoreValue}>
              {result.overall_score?.toFixed(1) || '--'}
            </Text>
          </View>
          <Text style={[styles.postScoreLabel, { color: scoreColor }]}>
            {result.score_label || 'SCORE'}
          </Text>
        </View>
      </View>

      {/* Bottom Stats */}
      <View style={styles.postStatsSection}>
        {result.scores && (
          <View style={styles.postStatsRow}>
            {Object.entries(result.scores).slice(0, 3).map(([key, value]) => (
              <View key={key} style={styles.postStatItem}>
                <Text style={styles.postStatValue}>{value.toFixed(1)}</Text>
                <Text style={styles.postStatLabel}>{key}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Branding */}
        <View style={styles.postBranding}>
          <View style={styles.postLogoContainer}>
            <Text style={styles.postLogoText}>FADECHECK</Text>
            <Ionicons name="checkmark-circle" size={16} color={CYAN_GLOW} />
          </View>
          <Text style={styles.postTagline}>AI Haircut Analysis</Text>
        </View>
      </View>
    </View>
  );

  const renderCompact = () => (
    <View style={[styles.compactContainer, { aspectRatio: dimensions.aspectRatio }]}>
      <LinearGradient
        colors={['#0A0A0F', '#12121A']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.compactContent}>
        <Image source={{ uri: imageUri }} style={styles.compactImage} />
        <View style={styles.compactInfo}>
          <Text style={[styles.compactScore, { color: scoreColor }]}>
            {result.overall_score?.toFixed(1) || '--'}/10
          </Text>
          <Text style={styles.compactLabel}>{result.score_label}</Text>
          <Text style={styles.compactBrand}>fadecheck.app</Text>
        </View>
      </View>
    </View>
  );

  const renderCard = () => {
    switch (variant) {
      case 'instagram-story':
      case 'tiktok':
        return renderInstagramStory();
      case 'instagram-post':
        return renderInstagramPost();
      case 'compact':
        return renderCompact();
      default:
        return renderInstagramPost();
    }
  };

  return (
    <View style={styles.container}>
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1 }}
        style={styles.viewShot}
      >
        {renderCard()}
      </ViewShot>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <LinearGradient
          colors={[ACCENT_BLUE, CYAN_GLOW]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shareButtonGradient}
        >
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Share to {variant === 'instagram-story' ? 'Story' : 'Feed'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  viewShot: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  // Story Styles
  storyContainer: {
    width: CARD_WIDTH,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
  },
  storyHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: TEXT_PRIMARY,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },
  storyImageContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    borderWidth: 3,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '900',
  },
  scoreOutOf: {
    fontSize: 20,
    color: TEXT_SECONDARY,
    marginLeft: 4,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  statLabel: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    letterSpacing: 1,
    marginTop: 2,
  },
  profileBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileText: {
    fontSize: 12,
    color: CYAN_GLOW,
    fontWeight: '600',
  },
  ctaContainer: {
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  ctaLink: {
    fontSize: 16,
    fontWeight: '700',
    color: CYAN_GLOW,
    letterSpacing: 1,
  },

  // Post Styles
  postContainer: {
    width: CARD_WIDTH,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postImageSection: {
    flex: 0.65,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  postScoreOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    alignItems: 'flex-start',
  },
  postScoreBadge: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postScoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  postScoreLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  postStatsSection: {
    flex: 0.35,
    padding: 16,
    justifyContent: 'space-between',
  },
  postStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  postStatItem: {
    alignItems: 'center',
  },
  postStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  postStatLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  postBranding: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postLogoText: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: 1,
  },
  postTagline: {
    fontSize: 11,
    color: TEXT_SECONDARY,
  },

  // Compact Styles
  compactContainer: {
    width: CARD_WIDTH * 0.6,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
  },
  compactImage: {
    width: '50%',
    height: '100%',
    resizeMode: 'cover',
  },
  compactInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactScore: {
    fontSize: 28,
    fontWeight: '900',
  },
  compactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_SECONDARY,
    letterSpacing: 1,
    marginTop: 4,
  },
  compactBrand: {
    fontSize: 10,
    color: CYAN_GLOW,
    marginTop: 8,
  },

  // Share Button
  shareButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
