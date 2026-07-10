// FadeCheck Design System v3: "Funky Fresh" — bright, colorful, cartoon-forward.
//
// Light cream base + bold color-blocking + chunky rounded shapes. Existing token
// keys are preserved (so no screen crashes) but repointed to the playful palette;
// new `pop`/`ink`/`surface` tokens drive the redesign.

const Colors = {
  // Backgrounds — warm, bright, friendly
  background: {
    void: '#EFE6D6', // deepest cream — behind modals
    primary: '#FBF3E4', // main screen background (warm cream)
    secondary: '#FFFFFF', // elevated surfaces / cards
    tertiary: '#FFFFFF', // card base
    overlay: 'rgba(23, 19, 15, 0.55)', // modal scrim
    card: '#FFFFFF',
  },

  // Playful "pop" palette — the heart of the funky look. Use in color blocks.
  pop: {
    lime: '#B4EC2E',
    limeInk: '#2C3B00',
    pink: '#FF4D9D',
    pinkInk: '#4A0022',
    yellow: '#FFD12E',
    yellowInk: '#4A3600',
    purple: '#7A5CFF',
    purpleInk: '#22124F',
    teal: '#14C7A8',
    tealInk: '#00332A',
    coral: '#FF6A3D',
    coralInk: '#4A1500',
    blue: '#3B6BFF',
    blueInk: '#001A55',
    cream: '#FBF3E4',
  },

  // Accent (brand) — playful purple lead + pink secondary
  accent: {
    primary: '#7A5CFF', // purple
    secondary: '#FF4D9D', // hot pink
    tertiary: '#FF6A3D', // coral (warnings/alerts)
    highlight: '#B4EC2E', // lime highlight
  },

  // Gradients — punchy
  gradient: {
    blue: ['#7A5CFF', '#FF4D9D'] as const,
    primary: ['#7A5CFF', '#A66BFF'] as const,
    button: ['#7A5CFF', '#9B6BFF'] as const,
    header: ['#FF4D9D', '#FF6A3D'] as const,
    glow: ['rgba(122, 92, 255, 0.35)', 'rgba(255, 77, 157, 0.18)'] as const,
    pro: ['#FFD12E', '#FF6A3D'] as const,
    sunrise: ['#FF6A3D', '#FFD12E'] as const,
    candy: ['#FF4D9D', '#7A5CFF'] as const,
  },

  // "Glass"/borders — dark sticker outlines on light theme
  glass: {
    border: 'rgba(23, 19, 15, 0.10)',
    borderActive: 'rgba(23, 19, 15, 0.85)', // sticker outline
    surface: 'rgba(255, 255, 255, 0.72)',
    overlay: 'rgba(122, 92, 255, 0.06)',
  },

  glow: {
    blue: 'rgba(122, 92, 255, 0.30)',
    cyan: 'rgba(255, 77, 157, 0.22)',
    ambient: 'rgba(255, 209, 46, 0.18)',
  },

  // Text — warm near-black ink
  text: {
    primary: '#17130F', // ink
    secondary: '#6B6157', // muted
    tertiary: '#A39A8E', // hint
    inverse: '#FFFFFF', // on dark/colored blocks
  },

  // Solid ink + line for sticker outlines
  ink: '#17130F',
  line: 'rgba(23, 19, 15, 0.12)',

  // Overall quality levels (Rate feature) — mapped to the pop palette
  level: {
    elite: '#7A5CFF',
    sharp: '#FF4D9D',
    clean: '#14C7A8',
    fresh: '#FFD12E',
    growing: '#FF6A3D',
  },

  tier: {
    strong: '#14C7A8',
    solid: '#3B6BFF',
    developing: '#FF6A3D',
  },
};

// Ordered pop colors for cycling per item (e.g. category cards, list rows).
export const POP_CYCLE = [
  Colors.pop.purple,
  Colors.pop.pink,
  Colors.pop.lime,
  Colors.pop.yellow,
  Colors.pop.teal,
  Colors.pop.coral,
  Colors.pop.blue,
] as const;

export const POP_INK_CYCLE = [
  Colors.pop.purpleInk,
  Colors.pop.pinkInk,
  Colors.pop.limeInk,
  Colors.pop.yellowInk,
  Colors.pop.tealInk,
  Colors.pop.coralInk,
  Colors.pop.blueInk,
] as const;

// Deterministic pop color from a string id (stable per style/category).
export function popFor(seed: string): { bg: string; ink: string } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const idx = h % POP_CYCLE.length;
  return { bg: POP_CYCLE[idx], ink: POP_INK_CYCLE[idx] };
}

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

export const getTierColor = (tier: string): string => {
  switch (tier) {
    case 'strong': return Colors.tier.strong;
    case 'solid': return Colors.tier.solid;
    case 'developing': return Colors.tier.developing;
    default: return Colors.text.secondary;
  }
};

export const getLevelGradient = (level: string): readonly [string, string] => {
  switch (level.toUpperCase()) {
    case 'ELITE': return ['#7A5CFF', '#A66BFF'] as const;
    case 'SHARP': return ['#FF4D9D', '#FF7AB8'] as const;
    case 'CLEAN': return ['#14C7A8', '#5AE0C8'] as const;
    case 'FRESH': return ['#FFD12E', '#FFE07A'] as const;
    case 'GROWING': return ['#FF6A3D', '#FF9670'] as const;
    default: return ['#A39A8E', '#C7BEB2'] as const;
  }
};

export default Colors;
