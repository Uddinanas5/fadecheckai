import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { typography, spacing, borderRadius } from '../constants/Styles';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

export default function AboutScreen() {
  const router = useRouter();

  const LinkRow = ({
    icon,
    title,
    onPress,
  }: {
    icon: string;
    title: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.linkRow} onPress={onPress}>
      <Ionicons name={icon as any} size={20} color={Colors.accent.primary} />
      <Text style={styles.linkTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Info */}
        <View style={styles.appInfoCard}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/Fadecheckailogo.png')}
              style={styles.appLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>FadeCheck</Text>
          <Text style={styles.appTagline}>Your personal grooming coach</Text>
          <Text style={styles.versionText}>
            Version {APP_VERSION} ({BUILD_NUMBER})
          </Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            FadeCheck is your personal grooming coach. Get instant feedback on your fade quality, lineup precision, blending, and personalized style recommendations.
          </Text>
        </View>

        {/* Legal Links */}
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <View style={styles.linksCard}>
          <LinkRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => router.push('/privacy-policy')}
          />
          <LinkRow
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => router.push('/terms-of-service')}
          />
        </View>

        {/* Support Links */}
        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.linksCard}>
          <LinkRow
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => router.push('/support')}
          />
          <LinkRow
            icon="mail-outline"
            title="Contact Us"
            onPress={() => Linking.openURL('mailto:fadecheck.app@gmail.com')}
          />
        </View>

        {/* Follow Us */}
        <Text style={styles.sectionTitle}>FOLLOW US</Text>
        <View style={styles.socialCard}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://instagram.com/fadecheck')}
          >
            <Ionicons name="logo-instagram" size={24} color={Colors.text.primary} />
            <Text style={styles.socialText}>Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://tiktok.com/@fadecheck')}
          >
            <Ionicons name="logo-tiktok" size={24} color={Colors.text.primary} />
            <Text style={styles.socialText}>TikTok</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => Linking.openURL('https://twitter.com/fadecheck')}
          >
            <Ionicons name="logo-twitter" size={24} color={Colors.text.primary} />
            <Text style={styles.socialText}>Twitter</Text>
          </TouchableOpacity>
        </View>

        {/* Credits */}
        <View style={styles.creditsCard}>
          <Text style={styles.creditsTitle}>Acknowledgments</Text>
          <Text style={styles.creditsText}>
            FadeCheck is powered by advanced AI technology for haircut analysis.
          </Text>
          <Text style={styles.creditsText}>
            Built with React Native and Expo.
          </Text>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          {'\u00A9'} {new Date().getFullYear()} FadeCheck. All rights reserved.
        </Text>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: Colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  appInfoCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoContainer: {
    marginBottom: spacing.md,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(1, 69, 242, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLogo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appName: {
    ...typography.h1,
    color: Colors.text.primary,
    marginBottom: spacing.xs,
  },
  appTagline: {
    ...typography.body,
    color: Colors.text.secondary,
    marginBottom: spacing.sm,
  },
  versionText: {
    ...typography.small,
    color: Colors.text.tertiary,
  },
  descriptionCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  descriptionText: {
    ...typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionTitle: {
    ...typography.label,
    color: Colors.text.tertiary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  linksCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  linkTitle: {
    ...typography.body,
    color: Colors.text.primary,
    flex: 1,
    marginLeft: spacing.md,
  },
  socialCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  socialButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  socialText: {
    ...typography.small,
    color: Colors.text.secondary,
    marginTop: spacing.xs,
  },
  creditsCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  creditsTitle: {
    ...typography.h3,
    color: Colors.text.primary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  creditsText: {
    ...typography.small,
    color: Colors.text.tertiary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  copyright: {
    ...typography.small,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
