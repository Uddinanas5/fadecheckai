import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { typography, spacing, borderRadius } from '../../constants/Styles';
import { useHistory } from '../../hooks/useHistory';
import { HistoryEntry } from '../../types';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, tryOns, ratings } = useHistory();

  const recent = entries.slice(0, 6);

  const thumbUri = (e: HistoryEntry) =>
    e.kind === 'tryon' ? e.tryOn.generatedImageUri : e.imageUri;

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    badge,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    badge?: string;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon as any} size={22} color={Colors.accent.primary} />
      </View>
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User card */}
        <View style={styles.userCard}>
          <LinearGradient colors={Colors.gradient.blue} style={styles.avatar}>
            <Ionicons name="person" size={30} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>FadeCheck User</Text>
            <Text style={styles.userSub}>Plan your next cut</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
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

        {/* Your looks */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>YOUR LOOKS</Text>
          {entries.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        {recent.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.looksRow}>
            {recent.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={styles.lookThumb}
                onPress={() => router.push('/history')}
                activeOpacity={0.85}
              >
                <Image source={{ uri: thumbUri(e) }} style={styles.lookImage} />
                <View style={styles.lookBadge}>
                  <Ionicons
                    name={e.kind === 'tryon' ? 'color-wand' : 'star'}
                    size={11}
                    color="#fff"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <TouchableOpacity
            style={styles.emptyLooks}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={22} color={Colors.accent.primary} />
            <Text style={styles.emptyLooksText}>Create your first look</Text>
          </TouchableOpacity>
        )}

        {/* Account */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.menuCard}>
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
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="FAQ and contact us"
            onPress={() => router.push('/support')}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="information-circle-outline"
            title="About FadeCheck"
            subtitle="Version and legal info"
            onPress={() => router.push('/about')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => router.push('/privacy-policy')}
          />
          <MenuItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => router.push('/terms-of-service')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  headerBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  headerTitle: { ...typography.h1, fontSize: 28 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  userName: { ...typography.h3 },
  userSub: { ...typography.caption, marginTop: 2 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { ...typography.h2, color: Colors.accent.primary },
  statLabel: { ...typography.small, color: Colors.text.tertiary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.glass.border, marginHorizontal: spacing.sm },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: Colors.text.tertiary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginTop: spacing.xs,
  },
  seeAll: { color: Colors.accent.primary, fontWeight: '600', fontSize: 13 },
  looksRow: { marginBottom: spacing.lg },
  lookThumb: {
    width: 88,
    height: 110,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.sm,
    backgroundColor: Colors.background.secondary,
  },
  lookImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  lookBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(5,5,8,0.6)',
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
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(122,92,255,0.4)',
    backgroundColor: 'rgba(122,92,255,0.05)',
    marginBottom: spacing.lg,
  },
  emptyLooksText: { color: Colors.accent.primary, fontWeight: '600', fontSize: 15 },
  menuCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(122,92,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuTitle: { ...typography.body, fontWeight: '500' },
  menuSubtitle: { ...typography.small, color: Colors.text.tertiary, marginTop: 2 },
  badge: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  badgeText: { color: '#fff', fontWeight: '600', fontSize: 11 },
});
