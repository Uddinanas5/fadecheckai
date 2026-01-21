export interface HaircutScores {
  lineup: number;
  fade: number;
  blend: number;
  shape: number;
  freshness: number;
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

export interface AnalysisResult {
  overall_score: number | null;
  scores: HaircutScores | null;
  score_label: string | null;
  improvement_areas?: string[] | null;
  // Legacy field for backwards compatibility
  defects_found?: string[] | null;
  breakdown: string;
  verdict: string;
  error?: boolean;
  // New comprehensive analysis fields
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

export type ScoreCategory = keyof HaircutScores;

export interface CapturedImages {
  front: string;
  leftSide: string;
  rightSide: string;
  back: string;
}
