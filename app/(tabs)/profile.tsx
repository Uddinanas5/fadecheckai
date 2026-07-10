// Profile — your looks, stats, settings, legal.
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { typography, spacing, borderRadius } from '../../constants/Styles';
import { Screen, Sticker, SectionLabel, IconDot } from '../../components/ui';
import { useHistory } from '../../hooks/useHistory';
import { HistoryEntry } from '../../types';

export default function ProfileScreen() {
  const router = useRouter();
  const { entries, tryOns, ratings } = useHistory();

  const recent = entries.slice(0, 6);
  const thumbUri = (e: HistoryEntry) => (e.kind === 'tryon' ? e.tryOn.generatedImageUri : e.imageUri);

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    badge,
    last = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    badge?: string;
    last?: boolean;
  }) => (
    <TouchableOpacity style={[styles.menuItem, !last && styles.menuDivider]} onPress={onPress}>
      <IconDot icon={icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );

  return (
    <Screen>
      <Text style={styles.headerTitle}>Profile</Text>

      {/* User card */}
      <Sticker style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>FadeCheck User</Text>
            <Text style={styles.userSub}>Plan your next cut ✂️</Text>
          </View>
        </View>
      </Sticker>

      {/* Stats */}
      <Sticker color={Colors.pop.yellow} style={{ marginBottom: spacing.sm }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{entries.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{tryOns.length}</Text>
            <Text style={styles.statLabel}>Try-ons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{ratings.length}</Text>
            <Text style={styles.statLabel}>Ratings</Text>
          </View>
        </View>
      </Sticker>

      {/* Your looks */}
      <SectionLabel
        right={entries.length > 0 ? 'See all' : undefined}
        onRightPress={() => router.push('/history')}
      >
        YOUR LOOKS
      </SectionLabel>
      {recent.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {recent.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.lookThumb}
              onPress={() => router.push('/history')}
              activeOpacity={0.85}
            >
              <Image source={{ uri: thumbUri(e) }} style={styles.lookImage} />
              <View style={styles.lookBadge}>
                <Ionicons name={e.kind === 'tryon' ? 'color-wand' : 'star'} size={11} color="#fff" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <TouchableOpacity style={styles.emptyLooks} onPress={() => router.push('/(tabs)')} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={22} color={Colors.accent.primary} />
          <Text style={styles.emptyLooksText}>Create your first look</Text>
        </TouchableOpacity>
      )}

      <SectionLabel>ACCOUNT</SectionLabel>
      <Sticker pad={0} style={{ marginBottom: spacing.sm }}>
        <MenuItem
          icon="images-outline"
          title="Your looks"
          subtitle="Saved try-ons and ratings"
          onPress={() => router.push('/history')}
          badge={entries.length > 0 ? String(entries.length) : undefined}
        />
        <MenuItem
          icon="settings-outline"
          title="Settings"
          subtitle="Privacy, data, and preferences"
          onPress={() => router.push('/settings')}
          last
        />
      </Sticker>

      <SectionLabel>SUPPORT</SectionLabel>
      <Sticker pad={0} style={{ marginBottom: spacing.sm }}>
        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="FAQ and contact us"
          onPress={() => router.push('/support')}
          last
        />
      </Sticker>

      <SectionLabel>ABOUT</SectionLabel>
      <Sticker pad={0}>
        <MenuItem
          icon="information-circle-outline"
          title="About FadeCheck"
          subtitle="Version and legal info"
          onPress={() => router.push('/about')}
        />
        <MenuItem icon="shield-checkmark-outline" title="Privacy Policy" onPress={() => router.push('/privacy-policy')} />
        <MenuItem icon="document-text-outline" title="Terms of Service" onPress={() => router.push('/terms-of-service')} last />
      </Sticker>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerTitle: { ...typography.h1, fontSize: 30, marginTop: spacing.sm },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.pop.purple,
    borderWidth: 2,
    borderColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: { ...typography.h3 },
  userSub: { ...typography.caption, marginTop: 2 },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: Colors.pop.yellowInk, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '800', color: Colors.pop.yellowInk, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2 },
  statDivider: { width: 2, backgroundColor: 'rgba(23,19,15,0.15)', marginHorizontal: spacing.sm },
  lookThumb: {
    width: 88,
    height: 110,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.ink,
  },
  lookImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  lookBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyLooks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 88,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.accent.primary,
    backgroundColor: 'rgba(122,92,255,0.06)',
    marginBottom: spacing.md,
  },
  emptyLooksText: { color: Colors.accent.primary, fontWeight: '800', fontSize: 15 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  menuTitle: { ...typography.body, fontWeight: '700' },
  menuSubtitle: { ...typography.small, marginTop: 2 },
  badge: {
    backgroundColor: Colors.pop.pink,
    borderWidth: 2,
    borderColor: Colors.ink,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 11 },
});
