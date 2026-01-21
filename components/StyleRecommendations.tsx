import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { FaceShape, HairType } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

const ACCENT_BLUE = '#0145F2';
const CYAN_GLOW = '#38BDF8';
const CARD_BG = '#12121A';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#8B8B9E';
const GLASS_BORDER = 'rgba(255,255,255,0.08)';

interface StyleRecommendation {
  id: string;
  name: string;
  description: string;
  suitability: 'perfect' | 'great' | 'good';
  difficulty: 'easy' | 'medium' | 'hard';
  maintenanceWeeks: number;
  tags: string[];
  imageUrl?: string;
}

interface StyleRecommendationsProps {
  faceShape: FaceShape;
  hairType: HairType;
}

// Style database based on face shape and hair type
const getStyleRecommendations = (faceShape: FaceShape, hairType: HairType): StyleRecommendation[] => {
  const baseStyles: Record<FaceShape, StyleRecommendation[]> = {
    oval: [
      {
        id: 'quiff',
        name: 'Textured Quiff',
        description: 'Volume on top with textured finish. Works amazingly with your balanced proportions.',
        suitability: 'perfect',
        difficulty: 'medium',
        maintenanceWeeks: 3,
        tags: ['versatile', 'modern', 'professional'],
      },
      {
        id: 'mid-fade-crop',
        name: 'Mid Fade Crop',
        description: 'Clean sides with a textured crop on top. Low maintenance, high impact.',
        suitability: 'perfect',
        difficulty: 'easy',
        maintenanceWeeks: 2,
        tags: ['clean', 'trendy', 'easy-style'],
      },
      {
        id: 'pompadour',
        name: 'Modern Pompadour',
        description: 'Classic style with volume swept back. Makes a statement.',
        suitability: 'great',
        difficulty: 'hard',
        maintenanceWeeks: 2,
        tags: ['bold', 'classic', 'statement'],
      },
      {
        id: 'buzz-fade',
        name: 'Buzz Cut with Skin Fade',
        description: 'Minimal and sharp. Perfect for showing off your balanced features.',
        suitability: 'great',
        difficulty: 'easy',
        maintenanceWeeks: 1,
        tags: ['minimal', 'sharp', 'low-maintenance'],
      },
    ],
    square: [
      {
        id: 'textured-fringe',
        name: 'Textured Fringe',
        description: 'Softens your strong jawline with movement on top. Very flattering.',
        suitability: 'perfect',
        difficulty: 'medium',
        maintenanceWeeks: 3,
        tags: ['soft', 'modern', 'flattering'],
      },
      {
        id: 'side-part',
        name: 'Classic Side Part',
        description: 'Timeless and sophisticated. Balances angular features beautifully.',
        suitability: 'perfect',
        difficulty: 'easy',
        maintenanceWeeks: 3,
        tags: ['classic', 'professional', 'refined'],
      },
      {
        id: 'messy-top',
        name: 'Messy Top Fade',
        description: 'Relaxed texture on top softens your strong features.',
        suitability: 'great',
        difficulty: 'easy',
        maintenanceWeeks: 2,
        tags: ['casual', 'effortless', 'youthful'],
      },
      {
        id: 'long-top-undercut',
        name: 'Long Top Undercut',
        description: 'Dramatic contrast that works great with strong bone structure.',
        suitability: 'great',
        difficulty: 'hard',
        maintenanceWeeks: 3,
        tags: ['bold', 'dramatic', 'trendy'],
      },
    ],
    round: [
      {
        id: 'high-fade-pompadour',
        name: 'High Fade Pompadour',
        description: 'Adds height to elongate your face. Very flattering for round faces.',
        suitability: 'perfect',
        difficulty: 'medium',
        maintenanceWeeks: 2,
        tags: ['elongating', 'bold', 'flattering'],
      },
      {
        id: 'faux-hawk',
        name: 'Faux Hawk',
        description: 'Creates vertical lines that add length to your face shape.',
        suitability: 'perfect',
        difficulty: 'medium',
        maintenanceWeeks: 2,
        tags: ['edgy', 'modern', 'elongating'],
      },
      {
        id: 'hard-part',
        name: 'Hard Part with Volume',
        description: 'The sharp line and height create angles that balance roundness.',
        suitability: 'great',
        difficulty: 'easy',
        maintenanceWeeks: 2,
        tags: ['sharp', 'structured', 'professional'],
      },
      {
        id: 'spiky-top',
        name: 'Spiky Textured Top',
        description: 'Vertical texture that adds visual length to your face.',
        suitability: 'great',
        difficulty: 'easy',
        maintenanceWeeks: 2,
        tags: ['youthful', 'fun', 'easy-style'],
      },
    ],
    oblong: [
      {
        id: 'fringe-fade',
        name: 'Fringe with Low Fade',
        description: 'The fringe shortens your face visually. Very flattering.',
        suitability: 'perfect',
        difficulty: 'easy',
        maintenanceWeeks: 3,
        tags: ['balancing', 'modern', 'flattering'],
      },
      {
        id: 'side-swept',
        name: 'Side Swept Style',
        description: 'Adds width and reduces perceived length of your face.',
        suitability: 'perfect',
        difficulty: 'easy',
        maintenanceWeeks: 3,
        tags: ['soft', 'classic', 'balanced'],
      },
      {
        id: 'layered-medium',
        name: 'Layered Medium Length',
        description: 'Layers add volume on the sides to balance your proportions.',
        suitability: 'great',
        difficulty: 'medium',
        maintenanceWeeks: 4,
        tags: ['natural', 'versatile', 'balanced'],
      },
      {
        id: 'textured-crop',
        name: 'Textured Crop with Fringe',
        description: 'Modern and balanced. The fringe is key for your face shape.',
        suitability: 'great',
        difficulty: 'easy',
        maintenanceWeeks: 3,
        tags: ['trendy', 'easy', 'balanced'],
      },
    ],
    heart: [
      {
        id: 'side-part-medium',
        name: 'Medium Side Part',
        description: 'Adds fullness at jaw level to balance your wider forehead.',
        suitability: 'perfect',
        difficulty: 'easy',
        maintenanceWeeks: 3,
        tags: ['balanced', 'classic', 'flattering'],
      },
      {
        id: 'fringe-textured',
        name: 'Textured Fringe',
        description: 'Covers forehead while adding style. Very flattering for you.',
        suitability: 'perfect',
        difficulty: 'medium',
        maintenanceWeeks: 3,
        tags: ['modern', 'flattering', 'stylish'],
      },
      {
        id: 'chin-length-layers',
        name: 'Chin Length Layers',
        description: 'Draws attention to lower face, balancing your proportions.',
        suitability: 'great',
        difficulty: 'medium',
        maintenanceWeeks: 4,
        tags: ['flowing', 'natural', 'balanced'],
      },
      {
        id: 'low-fade-sweep',
        name: 'Low Fade with Side Sweep',
        description: 'Clean but not too short. The sweep balances your forehead.',
        suitability: 'great',
        difficulty: 'easy',
        maintenanceWeeks: 2,
        tags: ['clean', 'professional', 'balanced'],
      },
    ],
    diamond: [
      {
        id: 'textured-quiff',
        name: 'Textured Quiff',
        description: 'Adds width to forehead while complementing your cheekbones.',
        suitability: 'perfect',
        difficulty: 'medium',
        maintenanceWeeks: 3,
        tags: ['balanced', 'modern', 'flattering'],
      },
      {
        id: 'side-swept-bangs',
        name: 'Side Swept Bangs',
        description: 'Widens the forehead appearance, balancing your diamond shape.',
        suitability: 'perfect',
        difficulty: 'easy',
        maintenanceWeeks: 3,
        tags: ['soft', 'balanced', 'stylish'],
      },
      {
        id: 'mid-fade-crop',
        name: 'Mid Fade Textured Crop',
        description: 'Clean sides showcase your cheekbones. Texture on top adds interest.',
        suitability: 'great',
        difficulty: 'easy',
        maintenanceWeeks: 2,
        tags: ['clean', 'modern', 'easy'],
      },
      {
        id: 'long-on-top',
        name: 'Long on Top Fade',
        description: 'Length on top with faded sides. Shows off your angular features.',
        suitability: 'great',
        difficulty: 'medium',
        maintenanceWeeks: 3,
        tags: ['versatile', 'stylish', 'modern'],
      },
    ],
  };

  return baseStyles[faceShape] || baseStyles.oval;
};

const getSuitabilityColor = (suitability: StyleRecommendation['suitability']) => {
  switch (suitability) {
    case 'perfect': return '#22C55E';
    case 'great': return CYAN_GLOW;
    case 'good': return '#F59E0B';
    default: return TEXT_SECONDARY;
  }
};

const getDifficultyIcon = (difficulty: StyleRecommendation['difficulty']) => {
  switch (difficulty) {
    case 'easy': return '●○○';
    case 'medium': return '●●○';
    case 'hard': return '●●●';
    default: return '○○○';
  }
};

export default function StyleRecommendations({ faceShape, hairType }: StyleRecommendationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const recommendations = getStyleRecommendations(faceShape, hairType);

  const handleCardPress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>STYLES FOR YOU</Text>
        <Text style={styles.subtitle}>
          Based on your {faceShape} face shape
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 12}
        decelerationRate="fast"
      >
        {recommendations.map((style, index) => (
          <TouchableOpacity
            key={style.id}
            style={[
              styles.card,
              expandedId === style.id && styles.cardExpanded
            ]}
            onPress={() => handleCardPress(style.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
              style={styles.cardGradient}
            >
              {/* Suitability Badge */}
              <View style={[
                styles.suitabilityBadge,
                { backgroundColor: getSuitabilityColor(style.suitability) + '20' }
              ]}>
                <Text style={[
                  styles.suitabilityText,
                  { color: getSuitabilityColor(style.suitability) }
                ]}>
                  {style.suitability === 'perfect' ? '★ PERFECT FIT' :
                   style.suitability === 'great' ? 'GREAT FIT' : 'GOOD FIT'}
                </Text>
              </View>

              {/* Style Name */}
              <Text style={styles.styleName}>{style.name}</Text>

              {/* Description */}
              <Text style={styles.styleDescription} numberOfLines={expandedId === style.id ? undefined : 2}>
                {style.description}
              </Text>

              {/* Quick Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Difficulty</Text>
                  <Text style={styles.statValue}>{getDifficultyIcon(style.difficulty)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Maintenance</Text>
                  <Text style={styles.statValue}>{style.maintenanceWeeks}w</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {style.tags.slice(0, 3).map((tag, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Expand indicator */}
              <View style={styles.expandIndicator}>
                <Ionicons
                  name={expandedId === style.id ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={TEXT_SECONDARY}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pro tip */}
      <View style={styles.proTip}>
        <Ionicons name="bulb-outline" size={16} color={CYAN_GLOW} />
        <Text style={styles.proTipText}>
          Show these to your barber for your next cut
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    overflow: 'hidden',
  },
  cardExpanded: {
    width: CARD_WIDTH * 1.1,
  },
  cardGradient: {
    padding: 16,
    minHeight: 200,
  },
  suitabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  suitabilityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  styleName: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  styleDescription: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 18,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    gap: 2,
  },
  statLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: TEXT_SECONDARY,
  },
  expandIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  proTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  proTipText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
  },
});
