import { StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/AppText';
import { APP_INFO } from '@/constants/appInfo';
import { Spacing } from '@/constants/theme';

export default function TermsScreen() {
  return (
    <ScreenContainer>
      <Header title="Terms of use" subtitle="Please read before using HIRAYA." showBack />

      <Card style={styles.card}>
        <AppText variant="subtitle">Purpose</AppText>
        <AppText variant="body" style={styles.paragraph}>
          HIRAYA is provided for research, education, and personal heat-awareness in{' '}
          {APP_INFO.studyArea}. It is not intended for clinical decision-making.
        </AppText>

        <AppText variant="subtitle">Medical disclaimer</AppText>
        <AppText variant="body" style={styles.paragraph}>
          {APP_INFO.medicalDisclaimer}
        </AppText>

        <AppText variant="subtitle">Accuracy</AppText>
        <AppText variant="body" style={styles.paragraph}>
          Weather, risk scores, and recommendations may be incomplete, delayed, or
          incorrect. Always use your judgment and follow official emergency guidance.
        </AppText>

        <AppText variant="subtitle">Your responsibility</AppText>
        <AppText variant="body" style={styles.paragraph}>
          You are responsible for the accuracy of the health information you enter and for
          how you use the app’s guidance.
        </AppText>

        <AppText variant="subtitle">Availability</AppText>
        <AppText variant="body" style={styles.paragraph}>
          Features that depend on internet services (weather, account sync) may be
          unavailable when offline or when those services are down.
        </AppText>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
  },
  paragraph: {
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
});
