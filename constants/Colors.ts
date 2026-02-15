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

  // Level Colors (qualitative tiers)
  level: {
    elite: '#0145F2',        // ELITE: Electric Blue
    sharp: '#38BDF8',        // SHARP: Cyan Glow
    clean: '#22C55E',        // CLEAN: Emerald
    fresh: '#FBBF24',        // FRESH: Amber
    growing: '#F97316',      // GROWING: Orange
  },

  // Tier Colors (sub-category tiers)
  tier: {
    strong: '#22C55E',       // Strong: Green
    solid: '#38BDF8',        // Solid: Cyan
    developing: '#F97316',   // Developing: Orange
  },
};

// Get color based on overall level
export const getLevelColor = (level: string): string => {
  switch (level.toUpperCase()) {
    case 'ELITE': return Colors.level.elite;
    case 'SHARP': return Colors.level.sharp;
    case 'CLEAN': return Colors.level.clean;
    case 'FRESH': return Colors.level.fresh;
    case 'GROWING': return Colors.level.growing;
    default: return Colors.text.secondary;
  }
};

// Get color for sub-category tier
export const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'strong': return Colors.tier.strong;
    case 'solid': return Colors.tier.solid;
    case 'developing': return Colors.tier.developing;
    default: return Colors.text.secondary;
  }
};

// Get gradient colors for level
export const getLevelGradient = (level: string): readonly [string, string] => {
  switch (level.toUpperCase()) {
    case 'ELITE': return ['#0145F2', '#38BDF8'] as const;
    case 'SHARP': return ['#38BDF8', '#22D3EE'] as const;
    case 'CLEAN': return ['#22C55E', '#4ADE80'] as const;
    case 'FRESH': return ['#FBBF24', '#FCD34D'] as const;
    case 'GROWING': return ['#F97316', '#FB923C'] as const;
    default: return ['#6B7280', '#9CA3AF'] as const;
  }
};

export default Colors;
