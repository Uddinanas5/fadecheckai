const Colors = {
  background: {
    primary: '#0D0D0D',
    secondary: '#1A1A1A',
    tertiary: '#262626',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  accent: {
    primary: '#00D4AA',
    secondary: '#FFD700',
    tertiary: '#FF6B6B',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    tertiary: '#666666',
  },
  score: {
    terrible: '#FF4444',
    bad: '#FF6B6B',
    below: '#FF8C00',
    decent: '#FFD700',
    good: '#9ACD32',
    great: '#00D4AA',
    perfect: '#00FF88',
  },
};

export const getScoreColor = (score: number): string => {
  if (score <= 2) return Colors.score.terrible;
  if (score <= 3) return Colors.score.bad;
  if (score <= 5) return Colors.score.below;
  if (score <= 6) return Colors.score.decent;
  if (score <= 7) return Colors.score.good;
  if (score <= 9) return Colors.score.great;
  return Colors.score.perfect;
};

export const getScoreLabel = (score: number): string => {
  if (score <= 3) return 'BOTCHED';
  if (score <= 4) return 'MID';
  if (score <= 5) return 'ACCEPTABLE';
  if (score <= 6) return 'DECENT';
  if (score <= 7) return 'CLEAN';
  if (score <= 9) return 'FIRE';
  return 'ELITE';
};

export default Colors;
