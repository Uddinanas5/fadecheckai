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

export default function TermsOfServiceScreen() {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

        <Section title="1. Acceptance of Terms">
          <Paragraph>
            By downloading, installing, or using FadeCheck ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.
          </Paragraph>
        </Section>

        <Section title="2. Description of Service">
          <Paragraph>
            FadeCheck is an AI-powered personal grooming coach that analyzes photos of haircuts and provides constructive feedback. The App uses artificial intelligence technology to evaluate haircut quality based on various factors including fade quality, lineup precision, and overall aesthetics.
          </Paragraph>
        </Section>

        <Section title="3. User Requirements">
          <Paragraph>
            To use the App, you must:
          </Paragraph>
          <BulletPoint>Be at least 13 years of age</BulletPoint>
          <BulletPoint>Have a compatible iOS device</BulletPoint>
          <BulletPoint>Agree to these Terms and our Privacy Policy</BulletPoint>
          <BulletPoint>Provide accurate information when creating an account (if applicable)</BulletPoint>
        </Section>

        <Section title="4. AI Analysis Disclaimer">
          <View style={styles.disclaimerBox}>
            <Ionicons name="information-circle" size={20} color={Colors.accent.secondary} />
            <Text style={styles.disclaimerText}>
              FadeCheck uses artificial intelligence to provide grooming feedback and is intended for personal self-improvement purposes only. Results are suggestions, not professional assessments. AI analysis is not a substitute for professional barber consultation. This app is designed for analyzing your own haircuts only - do not use it to judge or rate other people. We do not provide medical, dermatological, or professional styling advice. Consult a licensed barber or stylist for professional guidance.
            </Text>
          </View>
        </Section>

        <Section title="5. User Content">
          <Paragraph>
            By submitting photos to the App:
          </Paragraph>
          <BulletPoint>You confirm you have the right to share those images</BulletPoint>
          <BulletPoint>You grant us permission to process images through our AI system</BulletPoint>
          <BulletPoint>You understand images will be sent to our AI service for analysis</BulletPoint>
          <BulletPoint>You will not submit inappropriate, illegal, or harmful content</BulletPoint>
        </Section>

        <Section title="6. Prohibited Uses">
          <Paragraph>
            You agree NOT to use the App to:
          </Paragraph>
          <BulletPoint>Submit photos of others without their consent</BulletPoint>
          <BulletPoint>Upload inappropriate, offensive, or illegal content</BulletPoint>
          <BulletPoint>Attempt to reverse-engineer or hack the App</BulletPoint>
          <BulletPoint>Use the App for any unlawful purpose</BulletPoint>
          <BulletPoint>Harass, bully, or harm other users</BulletPoint>
        </Section>

        <Section title="7. Subscriptions & Payments">
          <Paragraph>
            FadeCheck may offer premium features through in-app purchases or subscriptions:
          </Paragraph>
          <BulletPoint>All purchases are processed through Apple's App Store</BulletPoint>
          <BulletPoint>Subscriptions auto-renew unless cancelled 24 hours before the end of the current period</BulletPoint>
          <BulletPoint>You can manage subscriptions in your Apple ID settings</BulletPoint>
          <BulletPoint>Refunds are subject to Apple's refund policy</BulletPoint>
        </Section>

        <Section title="8. Intellectual Property">
          <Paragraph>
            The App, including its design, features, and content, is owned by FadeCheck and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our permission.
          </Paragraph>
        </Section>

        <Section title="9. Limitation of Liability">
          <Paragraph>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW:
          </Paragraph>
          <BulletPoint>The App is provided "AS IS" without warranties of any kind</BulletPoint>
          <BulletPoint>We are not liable for any indirect, incidental, or consequential damages</BulletPoint>
          <BulletPoint>We do not guarantee the accuracy of AI-generated analysis</BulletPoint>
          <BulletPoint>Our total liability is limited to the amount you paid for the App</BulletPoint>
        </Section>

        <Section title="10. Indemnification">
          <Paragraph>
            You agree to indemnify and hold harmless FadeCheck, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the App or violation of these Terms.
          </Paragraph>
        </Section>

        <Section title="11. Termination">
          <Paragraph>
            We reserve the right to suspend or terminate your access to the App at any time, for any reason, including violation of these Terms. Upon termination, your right to use the App ceases immediately.
          </Paragraph>
        </Section>

        <Section title="12. Changes to Terms">
          <Paragraph>
            We may modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the new Terms. We will notify users of significant changes through the App or via email.
          </Paragraph>
        </Section>

        <Section title="13. Governing Law">
          <Paragraph>
            These Terms are governed by the laws of the State of California, United States. Any disputes shall be resolved in the state or federal courts located in California.
          </Paragraph>
        </Section>

        <Section title="14. Contact Information">
          <Paragraph>
            For questions about these Terms, please contact us at:
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
  disclaimerBox: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.accent.secondary,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerText: {
    ...typography.body,
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    marginLeft: spacing.sm,
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
