// FadeCheck Design System v2: Typography & Spacing
import { StyleSheet } from 'react-native';
import Colors from './Colors';

export const typography = {
  // Hero display for main scores
  hero: {
    fontSize: 72,
    fontWeight: '800' as const,
    letterSpacing: -3,
    color: Colors.text.primary,
  },
  // Large display numbers
  display: {
    fontSize: 56,
    fontWeight: '700' as const,
    letterSpacing: -2,
    color: Colors.text.primary,
  },
  // Page titles
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -1,
    color: Colors.text.primary,
  },
  // Section headers
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    color: Colors.text.primary,
  },
  // Card titles
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    color: Colors.text.primary,
  },
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: Colors.text.primary,
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: Colors.text.secondary,
  },
  // Captions
  caption: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    color: Colors.text.secondary,
  },
  // Small text
  small: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.text.tertiary,
  },
  // Labels - uppercase with generous spacing
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    color: Colors.text.secondary,
  },
  // Button text
  button: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
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

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,      // Buttons
  xl: 24,      // Cards
  xxl: 32,
  full: 9999,
};

// Glass card styling helper
export const glassCard = {
  backgroundColor: Colors.glass.surface,
  borderRadius: borderRadius.xl,
  borderWidth: 1,
  borderColor: Colors.glass.border,
  overflow: 'hidden' as const,
};

// Button heights
export const buttonHeight = {
  primary: 56,
  secondary: 48,
  small: 40,
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
  // Primary button - 56px height with gradient
  buttonPrimary: {
    height: 56,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Secondary button - outline style
  buttonSecondary: {
    height: 56,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  buttonTextSecondary: {
    color: Colors.text.primary,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  // Glass card style
  card: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.lg,
  },
  // Elevated card (higher contrast)
  cardElevated: {
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.lg,
  },
});
