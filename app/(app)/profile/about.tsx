import { StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/AppText';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { APP_INFO } from '@/constants/appInfo';
import { Spacing } from '@/constants/theme';

export default function AboutScreen() {
  return (
    <ScreenContainer>
      <Header title="About HIRAYA" subtitle="Heat-risk awareness for Tuguegarao." showBack />

      <Card style={styles.card}>
        <BrandLogo size="lg" />
        <AppText variant="body" muted>
          Version {APP_INFO.version}
        </AppText>
        <AppText variant="body" style={styles.paragraph}>
          HIRAYA helps residents of {APP_INFO.studyArea} understand heat-related risk using
          live weather, a personal health profile, and on-device risk assessment.
        </AppText>
        <AppText variant="body" style={styles.paragraph}>
          {APP_INFO.medicalDisclaimer}
        </AppText>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.sm,
    alignItems: 'center',
  },
  paragraph: {
    lineHeight: 22,
    marginTop: Spacing.sm,
    alignSelf: 'stretch',
  },
});
