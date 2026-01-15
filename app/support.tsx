import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { typography, spacing, borderRadius } from '../constants/Styles';

export default function SupportScreen() {
  const router = useRouter();

  const handleEmailSupport = () => {
    Linking.openURL('mailto:fadecheck.app@gmail.com?subject=FadeCheck%20Support%20Request');
  };

  const handleReportBug = () => {
    Linking.openURL('mailto:fadecheck.app@gmail.com?subject=Bug%20Report%20-%20FadeCheck&body=Please%20describe%20the%20issue%20you%20encountered:%0A%0ADevice:%0AiOS%20Version:%0AApp%20Version:%0A%0ASteps%20to%20reproduce:%0A1.%0A2.%0A3.');
  };

  const handleFeatureRequest = () => {
    Linking.openURL('mailto:fadecheck.app@gmail.com?subject=Feature%20Request%20-%20FadeCheck&body=I%20would%20like%20to%20suggest%20the%20following%20feature:');
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate FadeCheck',
      'Enjoying FadeCheck? Please rate us on the App Store!',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Rate',
          onPress: () => {
            Linking.openURL('https://apps.apple.com/app/id6757437429?action=write-review');
          },
        },
      ]
    );
  };

  const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{question}</Text>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );

  const ContactOption = ({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.contactOption} onPress={onPress}>
      <View style={styles.contactIconContainer}>
        <Ionicons name={icon as any} size={24} color={Colors.accent.primary} />
      </View>
      <View style={styles.contactContent}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Options */}
        <Text style={styles.sectionTitle}>GET IN TOUCH</Text>
        <View style={styles.contactCard}>
          <ContactOption
            icon="mail-outline"
            title="Email Support"
            subtitle="Get help from our team"
            onPress={handleEmailSupport}
          />
          <ContactOption
            icon="bug-outline"
            title="Report a Bug"
            subtitle="Let us know about issues"
            onPress={handleReportBug}
          />
          <ContactOption
            icon="bulb-outline"
            title="Feature Request"
            subtitle="Suggest new features"
            onPress={handleFeatureRequest}
          />
          <ContactOption
            icon="star-outline"
            title="Rate FadeCheck"
            subtitle="Share your feedback"
            onPress={handleRateApp}
          />
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqCard}>
          <FAQItem
            question="How does the haircut analysis work?"
            answer="FadeCheck uses AI technology to analyze photos of your haircut. It evaluates factors like fade quality, lineup sharpness, blending, and overall shape to provide personalized feedback and grooming tips."
          />
          <FAQItem
            question="Is my data private?"
            answer="Yes! Your photos are only used for analysis and are not stored on our servers. Analysis history is saved locally on your device. See our Privacy Policy for full details."
          />
          <FAQItem
            question="Why does my score vary?"
            answer="Lighting, angle, and photo quality can affect results. For the best accuracy, take photos in good lighting and capture multiple angles (front, sides, and back)."
          />
          <FAQItem
            question="How do I get FadeCheck Pro?"
            answer="You can upgrade to FadeCheck Pro through the app. Pro members get unlimited analyses, detailed breakdowns, and exclusive features."
          />
          <FAQItem
            question="How do I delete my data?"
            answer="Go to Settings > Delete All Data to permanently remove all your information. You can also clear just your history in Settings > Clear History."
          />
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfoCard}>
          <Text style={styles.contactInfoTitle}>Contact Information</Text>
          <View style={styles.contactInfoRow}>
            <Ionicons name="mail" size={16} color={Colors.accent.primary} />
            <Text style={styles.contactInfoText}>fadecheck.app@gmail.com</Text>
          </View>
          <Text style={styles.responseTime}>
            We typically respond within 24-48 hours
          </Text>
        </View>

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
  sectionTitle: {
    ...typography.label,
    color: Colors.text.tertiary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginTop: spacing.md,
  },
  contactCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    overflow: 'hidden',
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(1, 69, 242, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  contactSubtitle: {
    ...typography.small,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  faqCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.md,
  },
  faqItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glass.border,
  },
  faqQuestion: {
    ...typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  faqAnswer: {
    ...typography.body,
    color: Colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  contactInfoCard: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.border,
    padding: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  contactInfoTitle: {
    ...typography.h3,
    color: Colors.text.primary,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactInfoText: {
    ...typography.body,
    color: Colors.accent.primary,
    marginLeft: spacing.sm,
  },
  responseTime: {
    ...typography.small,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
