import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { typography, spacing, borderRadius } from '../constants/Styles';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const Paragraph = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.paragraph}>{children}</Text>
  );

  const BulletPoint = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.bulletContainer}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: January 15, 2026</Text>

        <Section title="Introduction">
          <Paragraph>
            FadeCheck ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Paragraph>
        </Section>

        <Section title="Information We Collect">
          <Paragraph>
            We collect the following types of information:
          </Paragraph>
          <BulletPoint>Photos of your haircut that you voluntarily submit for AI analysis</BulletPoint>
          <BulletPoint>Face shape analysis data (processed in real-time for style recommendations, not stored)</BulletPoint>
          <BulletPoint>Device information (device type, operating system version)</BulletPoint>
          <BulletPoint>App usage data (features used, analysis history stored locally)</BulletPoint>
          <BulletPoint>Account info: Email and name (if provided) when you sign in with Apple or Google (optional)</BulletPoint>
        </Section>

        <View style={styles.aiDisclosureBox}>
          <View style={styles.aiDisclosureHeader}>
            <Ionicons name="sparkles" size={20} color={Colors.accent.primary} />
            <Text style={styles.aiDisclosureTitle}>AI Data Sharing Disclosure</Text>
          </View>
          <Text style={styles.aiDisclosureText}>
            FadeCheck uses OpenAI's GPT-4 Vision API to analyze your haircut photos. When you submit photos, our AI evaluates:
          </Text>
          <Text style={[styles.aiDisclosureText, { marginTop: 8 }]}>
            • Haircut quality (fade, lineup, blend, shape, freshness){'\n'}
            • Hair type classification (1A-4C){'\n'}
            • Face shape (for personalized style recommendations){'\n'}
            • Grooming tips tailored to you
          </Text>
          <Text style={[styles.aiDisclosureText, { marginTop: 12, fontWeight: '600' }]}>
            How your data is handled:
          </Text>
          <BulletPoint>Photos transmitted securely via HTTPS encryption</BulletPoint>
          <BulletPoint>Processed in real-time, never permanently stored by OpenAI</BulletPoint>
          <BulletPoint>Per OpenAI's API terms, your data is NOT used to train their models</BulletPoint>
          <BulletPoint>Analysis history stored only on your device</BulletPoint>
        </View>

        <Section title="How We Use Your Information">
          <Paragraph>
            We use the collected information for:
          </Paragraph>
          <BulletPoint>Providing AI-powered haircut analysis and scoring</BulletPoint>
          <BulletPoint>Storing your analysis history locally on your device</BulletPoint>
          <BulletPoint>Improving our app and user experience</BulletPoint>
          <BulletPoint>Responding to your inquiries and support requests</BulletPoint>
        </Section>

        <Section title="Data Storage & Security">
          <Paragraph>
            Your analysis history is stored locally on your device using secure storage mechanisms. We do not maintain copies of your photos on our servers.
          </Paragraph>
          <Paragraph>
            When photos are sent for AI analysis, they are transmitted using industry-standard encryption (HTTPS/TLS).
          </Paragraph>
        </Section>

        <Section title="Third-Party Services">
          <Paragraph>
            We use the following third-party services:
          </Paragraph>
          <BulletPoint>
            OpenAI - For AI-powered image analysis (GPT-4 Vision). Photos processed in real-time, never stored.
          </BulletPoint>
          <BulletPoint>
            Supabase - For user authentication and account management (encrypted).
          </BulletPoint>
          <BulletPoint>
            Apple Sign In - For secure account creation and login.
          </BulletPoint>
          <BulletPoint>
            Google Sign In - For secure account creation and login.
          </BulletPoint>
          <BulletPoint>
            RevenueCat - For subscription management and billing.
          </BulletPoint>
          <BulletPoint>
            Apple App Store - For app distribution and in-app purchases.
          </BulletPoint>
        </Section>

        <Section title="Your Rights & Choices">
          <Paragraph>
            You have the right to:
          </Paragraph>
          <BulletPoint>Access: View your data stored in the app</BulletPoint>
          <BulletPoint>Delete: Clear your analysis history anytime via Settings</BulletPoint>
          <BulletPoint>Withdraw Consent: Disable AI analysis in Settings</BulletPoint>
          <BulletPoint>Account Deletion: Delete your account and all associated data via Settings</BulletPoint>
          <BulletPoint>Export: Request a copy of your data by contacting us</BulletPoint>
        </Section>

        <Section title="Data Retention">
          <Paragraph>
            Local analysis history is retained on your device until you choose to delete it. Photos sent for AI analysis are processed in real-time (typically within seconds) and are never permanently stored after processing is complete.
          </Paragraph>
        </Section>

        <Section title="Children's Privacy">
          <Paragraph>
            FadeCheck is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </Paragraph>
        </Section>

        <Section title="Changes to This Policy">
          <Paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Paragraph>
        </Section>

        <Section title="Contact Us">
          <Paragraph>
            If you have questions about this Privacy Policy or our data practices, please contact us at:
          </Paragraph>
          <Text style={styles.contactEmail}>support@fadecheck.app</Text>
        </Section>

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
    padding: spacing.lg,
  },
  lastUpdated: {
    ...typography.caption,
    color: Colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    color: Colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  bullet: {
    color: Colors.accent.primary,
    fontSize: 16,
    marginRight: spacing.sm,
    lineHeight: 22,
  },
  bulletText: {
    ...typography.body,
    color: Colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  aiDisclosureBox: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.accent.primary,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  aiDisclosureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aiDisclosureTitle: {
    ...typography.h3,
    color: Colors.accent.primary,
    marginLeft: spacing.sm,
    fontSize: 16,
  },
  aiDisclosureText: {
    ...typography.body,
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  contactEmail: {
    ...typography.body,
    color: Colors.accent.primary,
    marginTop: spacing.xs,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
