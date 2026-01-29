// FadeCheck Design System v2: Liquid Glass + Electric Blue

const Colors = {
  // Background Hierarchy (darkest to lightest)
  background: {
    void: '#050508',         // Deepest black - behind modals
    primary: '#0A0A0F',      // Surface - main screen backgrounds
    secondary: '#12121A',    // Elevated - raised elements
    tertiary: '#1A1A24',     // Card base
    overlay: 'rgba(5, 5, 8, 0.85)',  // Modal overlays
    card: '#1A1A24',
  },

  // Accent Colors
  accent: {
    primary: '#0145F2',      // Electric Blue - main brand color
    secondary: '#38BDF8',    // Cyan Glow - secondary accent
    tertiary: '#FF6B6B',     // Coral - warnings/alerts
    highlight: '#60A5FA',    // Light blue for highlights
  },

  // Gradients
  gradient: {
    blue: ['#0145F2', '#38BDF8'] as const,
    primary: ['#0145F2', '#38BDF8'] as const,
    button: ['#0145F2', '#2563EB'] as const,    // Button gradient
    header: ['#0145F2', '#3B82F6'] as const,    // Header accent
    glow: ['rgba(1, 69, 242, 0.4)', 'rgba(56, 189, 248, 0.2)'] as const,
    pro: ['#0145F2', '#38BDF8'] as const,
  },

  // Glass Effects
  glass: {
    border: 'rgba(255, 255, 255, 0.10)',        // Glass border
    borderActive: 'rgba(255, 255, 255, 0.15)',  // Active glass border
    surface: 'rgba(26, 26, 36, 0.60)',          // Glass surface
    overlay: 'rgba(1, 69, 242, 0.05)',          // Blue tint overlay
  },

  // Glow Effects
  glow: {
    blue: 'rgba(1, 69, 242, 0.25)',
    cyan: 'rgba(56, 189, 248, 0.20)',
    ambient: 'rgba(1, 69, 242, 0.15)',
  },

  // Text Colors
  text: {
    primary: '#EDF1F5',      // Canvas Cloud - primary text
    secondary: '#9CA3AF',    // Muted text
    tertiary: '#6B7280',     // Disabled/hint text
    inverse: '#0A0A0F',      // Text on light backgrounds
  },

  // Score Colors (based on score ranges)
  score: {
    expert: '#0145F2',       // 9-10: Electric Blue (Expert Level)
    excellent: '#38BDF8',    // 8-8.9: Cyan Glow (Excellent)
    great: '#22C55E',        // 6.5-7.9: Emerald (Great)
    fair: '#FBBF24',         // 5-6.4: Amber (Fair)
    developing: '#F97316',   // 3.5-4.9: Orange (Developing)
    freshStart: '#EF4444',   // 0-3.4: Red (Fresh Start)
  },
};

// Get score color based on score value
export const getScoreColor = (score: number): string => {
  if (score >= 9) return Colors.score.expert;
  if (score >= 8) return Colors.score.excellent;
  if (score >= 6.5) return Colors.score.great;
  if (score >= 5) return Colors.score.fair;
  if (score >= 3.5) return Colors.score.developing;
  return Colors.score.freshStart;
};

// Get quality label based on score value
export const getScoreLabel = (score: number): string => {
  if (score >= 9.5) return 'EXCEPTIONAL';
  if (score >= 9) return 'EXCELLENT';
  if (score >= 8) return 'GREAT';
  if (score >= 7) return 'SOLID';
  if (score >= 6) return 'GOOD START';
  if (score >= 5) return 'BUILDING UP';
  if (score >= 4) return 'ROOM TO GROW';
  if (score >= 3) return 'GETTING STARTED';
  return 'FRESH START';
};

// Get gradient colors for score
export const getScoreGradient = (score: number): readonly [string, string] => {
  if (score >= 9) return ['#0145F2', '#38BDF8'] as const;
  if (score >= 8) return ['#38BDF8', '#22D3EE'] as const;
  if (score >= 6.5) return ['#22C55E', '#4ADE80'] as const;
  if (score >= 5) return ['#FBBF24', '#FCD34D'] as const;
  if (score >= 3.5) return ['#F97316', '#FB923C'] as const;
  return ['#EF4444', '#F87171'] as const;
};

export default Colors;
