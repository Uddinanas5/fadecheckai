export type TierLevel = 'strong' | 'solid' | 'developing';

export interface HaircutScores {
  lineup: TierLevel;
  fade: TierLevel;
  blend: TierLevel;
  shape: TierLevel;
  freshness: TierLevel;
}

// Hair type using Andre Walker system (1A-4C)
export type HairType = '1A' | '1B' | '1C' | '2A' | '2B' | '2C' | '3A' | '3B' | '3C' | '4A' | '4B' | '4C';

// Face shapes
export type FaceShape = 'oval' | 'square' | 'round' | 'oblong' | 'heart' | 'diamond';

// Fade types
export type FadeType = 'skin' | 'shadow' | 'low' | 'mid' | 'high' | 'drop' | 'burst' | 'taper' | 'temple' | 'none';

// Hair profile detected from images
export interface HairProfile {
  hair_type: HairType;
  hair_type_name: string;
  hair_type_description: string;
  density: 'thin' | 'medium' | 'thick';
  density_description: string;
}

// Face shape analysis
export interface FaceAnalysis {
  face_shape: FaceShape;
  face_shape_description: string;
  style_recommendation: string;
}

// Fade details
export interface FadeDetails {
  fade_type: FadeType;
  fade_type_name: string;
  fade_description: string;
}

// Maintenance info
export interface MaintenanceInfo {
  days_until_touchup: string;
  maintenance_schedule: string;
  maintenance_tip: string;
}

// Product recommendation
export interface ProductRecommendation {
  product_type: string;
  why: string;
}

export type OverallLevel = 'ELITE' | 'SHARP' | 'CLEAN' | 'FRESH' | 'GROWING';

export interface AnalysisResult {
  overall_level: OverallLevel | null;
  scores: HaircutScores | null;
  areas_to_improve?: string[] | null;
  breakdown: string;
  verdict: string;
  error?: boolean;
  // Comprehensive analysis fields
  hair_profile?: HairProfile | null;
  face_analysis?: FaceAnalysis | null;
  fade_details?: FadeDetails | null;
  maintenance?: MaintenanceInfo | null;
  product_recommendations?: ProductRecommendation[] | null;
}

export interface HistoryItem {
  id: string;
  imageUri: string;
  result: AnalysisResult;
  timestamp: number;
}

export interface CapturedImages {
  front: string;
  leftSide: string;
  rightSide: string;
  back: string;
}

// ---------------------------------------------------------------------------
// FadeCheck 2.0 — "Plan your next cut" (catalog + try-on)
// ---------------------------------------------------------------------------

import type { ImageSourcePropType } from 'react-native';

// Broad style families used for browsing/filtering the catalog.
export type HaircutCategory =
  | 'fade'
  | 'taper'
  | 'crop'
  | 'quiff'
  | 'pompadour'
  | 'buzz'
  | 'fringe'
  | 'curly'
  | 'long'
  | 'classic';

export const CATEGORY_LABELS: Record<HaircutCategory, string> = {
  fade: 'Fades',
  taper: 'Tapers',
  crop: 'Crops',
  quiff: 'Quiffs',
  pompadour: 'Pompadours',
  buzz: 'Buzz Cuts',
  fringe: 'Fringes',
  curly: 'Curly',
  long: 'Long',
  classic: 'Classic',
};

// A single haircut in the bundled catalog.
export interface Haircut {
  id: string; // slug, e.g. 'mid-taper-fade'
  name: string; // display name, e.g. 'Mid Taper Fade'
  category: HaircutCategory;
  tagline: string; // one-liner shown on cards
  description: string; // 2-3 sentences
  bestFaceShapes: FaceShape[]; // used by the recommender
  bestHairTypes: HairType[]; // used by the recommender
  maintenance: string; // e.g. 'Every 2-3 weeks'
  difficulty: 'easy' | 'medium' | 'advanced';
  barberInstructions: string[]; // "what to ask for" bullets
  tryOnPrompt: string; // instruction fed to the image model to apply this cut
  thumbnail: ImageSourcePropType; // catalog card image (bundled)
  referenceImages: ImageSourcePropType[]; // gallery images (bundled, 3-5 each)
}

// A catalog style matched to the current user, with an explanation.
export interface StyleRecommendation {
  styleId: string;
  reason: string; // why it suits this user
  score: number; // 0-100 match strength
}

// The output of a try-on generation.
export interface TryOnResult {
  id: string;
  styleId: string;
  styleName: string;
  sourceImageUri: string;
  generatedImageUri: string;
  createdAt: number;
  demo?: boolean; // true when produced by offline demo mode
}

// Unified history entry: either a past rating or a saved try-on.
export type HistoryEntry =
  | { kind: 'rating'; id: string; imageUri: string; result: AnalysisResult; timestamp: number }
  | { kind: 'tryon'; id: string; tryOn: TryOnResult; timestamp: number };
