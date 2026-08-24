import { StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/AppText';
import { APP_INFO } from '@/constants/appInfo';
import { Spacing } from '@/constants/theme';

export default function PrivacyScreen() {
  return (
    <ScreenContainer>
      <Header title="Privacy" subtitle="How HIRAYA handles your data." showBack />

      <Card style={styles.card}>
        <AppText variant="subtitle">Account data</AppText>
        <AppText variant="body" style={styles.paragraph}>
          When you create an account, HIRAYA stores your email, name, and authentication
          details with our auth provider (Supabase) so you can sign in securely.
        </AppText>

        <AppText variant="subtitle">Health profile</AppText>
        <AppText variant="body" style={styles.paragraph}>
          Profile details such as age and health conditions are used only to personalize
          heat-risk guidance. They are saved on your device and, when configured, synced to
          your private cloud account.
        </AppText>

        <AppText variant="subtitle">Assessments & history</AppText>
        <AppText variant="body" style={styles.paragraph}>
          Risk check-ins and refresh history may be stored locally and in your private cloud
          account so you can review past results.
        </AppText>

        <AppText variant="subtitle">Weather</AppText>
        <AppText variant="body" style={styles.paragraph}>
          Live weather for {APP_INFO.studyArea} is fetched from a weather provider. The app
          uses a fixed study-area location, not your phone GPS.
        </AppText>

        <AppText variant="subtitle">Contact</AppText>
        <AppText variant="body" style={styles.paragraph}>
          For privacy questions about this research app, contact your project administrator
          or thesis adviser.
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
