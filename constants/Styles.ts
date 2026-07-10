// FadeCheck Design System v3: Typography, spacing, chunky shapes.
import { StyleSheet } from 'react-native';
import Colors from './Colors';

export const typography = {
  // Hero display — big, bold, friendly
  hero: {
    fontSize: 46,
    fontWeight: '800' as const,
    letterSpacing: -1.5,
    color: Colors.text.primary,
  },
  display: {
    fontSize: 40,
    fontWeight: '800' as const,
    letterSpacing: -1.2,
    color: Colors.text.primary,
  },
  h1: {
    fontSize: 30,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
    color: Colors.text.primary,
  },
  h2: {
    fontSize: 23,
    fontWeight: '800' as const,
    letterSpacing: -0.4,
    color: Colors.text.primary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    color: Colors.text.primary,
  },
  body: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: Colors.text.primary,
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: Colors.text.secondary,
  },
  caption: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  small: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.tertiary,
  },
  label: {
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    color: Colors.text.secondary,
  },
  button: {
    fontSize: 17,
    fontWeight: '800' as const,
    letterSpacing: -0.2,
    color: Colors.text.primary,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Chunky, rounded — the funky look
export const borderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 22, // buttons (pill-ish)
  xl: 28, // cards
  xxl: 36,
  full: 9999,
};

// Sticker-style card: white, big radius, soft warm shadow
export const stickerCard = {
  backgroundColor: Colors.background.secondary,
  borderRadius: borderRadius.xl,
  borderWidth: 1,
  borderColor: Colors.line,
  overflow: 'hidden' as const,
};

// Soft playful drop shadow (iOS) — reuse via {...softShadow}
export const softShadow = {
  shadowColor: '#17130F',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.10,
  shadowRadius: 18,
  elevation: 6,
};

// Backwards-compat alias
export const glassCard = stickerCard;

export const buttonHeight = {
  primary: 58,
  secondary: 52,
  small: 44,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonPrimary: {
    height: 58,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonSecondary: {
    height: 58,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.text.inverse,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  buttonTextSecondary: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: spacing.lg,
  },
  cardElevated: {
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: spacing.lg,
  },
});
