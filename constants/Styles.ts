import { StyleSheet } from 'react-native';
import Colors from './Colors';

export const typography = {
  hero: {
    fontSize: 72,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.primary,
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text.secondary,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.text.tertiary,
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
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
    backgroundColor: Colors.accent.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: Colors.accent.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
});
