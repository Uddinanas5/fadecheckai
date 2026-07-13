// FadeCheck UI Kit — the single source of visual truth for the funky light theme.
//
// Every screen composes these primitives instead of hand-rolling styles, so the
// whole app moves together: chunky pills, ink sticker outlines, pop color
// blocks, soft warm shadows on a cream canvas.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { spacing, borderRadius, softShadow, typography } from '../constants/Styles';

// ---------------------------------------------------------------------------
// Screen — cream canvas with safe-area top padding and room for the floating
// tab bar at the bottom. `scroll` wraps children in a ScrollView.
// ---------------------------------------------------------------------------
export function Screen({
  children,
  scroll = true,
  padded = true,
  bottomSpace = 130,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  bottomSpace?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const pad = padded ? spacing.lg : 0;
  if (!scroll) {
    return (
      <View style={[kit.screen, { paddingTop: insets.top }, style]}>{children}</View>
    );
  }
  return (
    <View style={[kit.screen, { paddingTop: insets.top }, style]}>
      <ScrollView
        contentContainerStyle={{
          padding: pad,
          paddingBottom: insets.bottom + bottomSpace,
          width: '100%',
          maxWidth: 560,
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ScreenHeader — back chevron + centered title (+ optional right slot).
// ---------------------------------------------------------------------------
export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={kit.header}>
      {onBack ? (
        <TouchableOpacity style={kit.headerBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={Colors.ink} />
        </TouchableOpacity>
      ) : (
        <View style={kit.headerBtn} />
      )}
      <Text style={kit.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={kit.headerBtn}>{right}</View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Sticker — the signature card: big radius, 2px ink outline, soft shadow.
// `color` fills it with a pop block; default is white.
// ---------------------------------------------------------------------------
export function Sticker({
  children,
  color = '#FFFFFF',
  pad = spacing.md,
  style,
  flat = false,
}: {
  children: React.ReactNode;
  color?: string;
  pad?: number;
  style?: StyleProp<ViewStyle>;
  flat?: boolean;
}) {
  return (
    <View
      style={[
        kit.sticker,
        { backgroundColor: color, padding: pad },
        !flat && softShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Buttons — chunky pills with ink outlines.
// ---------------------------------------------------------------------------
export function PopButton({
  label,
  icon,
  onPress,
  color = Colors.pop.purple,
  textColor = '#FFFFFF',
  style,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      style={[kit.popBtn, { backgroundColor: color }, softShadow, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {icon ? <Ionicons name={icon} size={21} color={textColor} /> : null}
      <Text style={[kit.popBtnText, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function OutlineButton({
  label,
  icon,
  onPress,
  style,
  textStyle,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <TouchableOpacity style={[kit.outlineBtn, style]} onPress={onPress} activeOpacity={0.85}>
      {icon ? <Ionicons name={icon} size={20} color={Colors.ink} /> : null}
      <Text style={[kit.outlineBtnText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Chip — filter pills / small badges.
// ---------------------------------------------------------------------------
export function Chip({
  label,
  active = false,
  onPress,
  color = Colors.pop.yellow,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  const inner = (
    <View style={[kit.chip, active && { backgroundColor: color }]}>
      <Text style={kit.chipText}>{label}</Text>
    </View>
  );
  if (!onPress) return inner;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      {inner}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// SectionLabel — small uppercase section heading with optional right action.
// ---------------------------------------------------------------------------
export function SectionLabel({
  children,
  right,
  onRightPress,
}: {
  children: string;
  right?: string;
  onRightPress?: () => void;
}) {
  return (
    <View style={kit.sectionRow}>
      <Text style={kit.sectionLabel}>{children}</Text>
      {right ? (
        <TouchableOpacity onPress={onRightPress} activeOpacity={0.7}>
          <Text style={kit.sectionRight}>{right}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// IconDot — small rounded icon badge used in list rows.
// ---------------------------------------------------------------------------
export function IconDot({
  icon,
  color = 'rgba(122,92,255,0.14)',
  iconColor = Colors.accent.primary,
  size = 42,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  iconColor?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: color,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Ionicons name={icon} size={size * 0.5} color={iconColor} />
    </View>
  );
}

const kit = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center' },
  sticker: {
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.ink,
    overflow: 'hidden',
  },
  popBtn: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.ink,
    paddingHorizontal: spacing.lg,
  },
  popBtnText: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  outlineBtn: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
  },
  outlineBtnText: { color: Colors.ink, fontSize: 16, fontWeight: '800' },
  chip: {
    paddingHorizontal: spacing.md,
    height: 40,
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: Colors.ink,
    backgroundColor: '#FFFFFF',
  },
  chipText: { fontSize: 14, fontWeight: '800', color: Colors.ink },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionLabel: { ...typography.label, color: Colors.text.secondary },
  sectionRight: { color: Colors.accent.primary, fontWeight: '800', fontSize: 13 },
});
