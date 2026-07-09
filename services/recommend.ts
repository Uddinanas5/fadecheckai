// Deterministic style recommender.
//
// Turns the AI analysis of the user's current photo (face shape + hair type)
// into a ranked list of catalog styles with human-readable reasons. Pure and
// offline — no extra model call — so recommendations are instant and free.

import { HAIRCUTS } from '../constants/haircuts';
import {
  AnalysisResult,
  FaceShape,
  HairType,
  Haircut,
  StyleRecommendation,
} from '../types';

const FACE_SHAPE_BLURB: Record<FaceShape, string> = {
  oval: 'your balanced oval face works with almost anything',
  square: 'your strong jawline pairs well with texture and volume up top',
  round: 'height on top helps lengthen a round face',
  oblong: 'fringes and shorter tops balance a longer face',
  heart: 'volume through the sides balances a wider forehead',
  diamond: 'volume on top complements your angular features',
};

// Same curl family (e.g. all "3x") counts as a partial match.
function hairFamily(t: HairType): string {
  return t.charAt(0);
}

function scoreStyle(
  style: Haircut,
  faceShape: FaceShape | null,
  hairType: HairType | null,
): number {
  let score = 55; // baseline — every style is a plausible option

  if (faceShape && style.bestFaceShapes.includes(faceShape)) {
    score += 25;
  }

  if (hairType) {
    if (style.bestHairTypes.includes(hairType)) {
      score += 20;
    } else if (style.bestHairTypes.some((t) => hairFamily(t) === hairFamily(hairType))) {
      score += 10;
    } else {
      score -= 10; // this texture isn't ideal for the style
    }
  }

  // Nudge low-maintenance, easy styles slightly up as safe crowd-pleasers.
  if (style.difficulty === 'easy') score += 3;

  return Math.max(0, Math.min(100, score));
}

function buildReason(
  style: Haircut,
  faceShape: FaceShape | null,
  hairType: HairType | null,
): string {
  const parts: string[] = [];

  if (faceShape && style.bestFaceShapes.includes(faceShape)) {
    parts.push(FACE_SHAPE_BLURB[faceShape]);
  }

  if (hairType) {
    const exact = style.bestHairTypes.includes(hairType);
    const family = style.bestHairTypes.some((t) => hairFamily(t) === hairFamily(hairType));
    if (exact || family) {
      parts.push(`it suits your ${hairType} hair`);
    }
  }

  if (parts.length === 0) {
    parts.push('a versatile, broadly flattering option');
  }

  // Capitalize the first letter of the combined reason.
  const reason = parts.join(', and ');
  return reason.charAt(0).toUpperCase() + reason.slice(1) + '.';
}

/**
 * Rank the catalog for a given analysis. Returns the top `limit` styles.
 * Falls back to a sensible default ordering when analysis fields are missing.
 */
export function recommendStyles(
  result: AnalysisResult | null,
  limit = 6,
): StyleRecommendation[] {
  const faceShape = result?.face_analysis?.face_shape ?? null;
  const hairType = result?.hair_profile?.hair_type ?? null;

  const ranked = HAIRCUTS.map((style) => ({
    style,
    score: scoreStyle(style, faceShape, hairType),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked.map(({ style, score }) => ({
    styleId: style.id,
    score,
    reason: buildReason(style, faceShape, hairType),
  }));
}
