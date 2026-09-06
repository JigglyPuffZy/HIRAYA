import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Header } from '@/components/layout/Header';
import { AssessmentFormContainer } from '@/components/assessment/AssessmentFormContainer';
import { Card } from '@/components/ui/Card';
import { AppText } from '@/components/ui/AppText';
import { RiskResultPayload } from '@/types/prediction';
import { ROUTES } from '@/constants/routes';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function AssessmentScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleSuccess = (result: RiskResultPayload) => {
    router.push({
      pathname: ROUTES.RESULT,
      params: {
        payload: JSON.stringify(result),
      },
    });
  };

  return (
    <ScreenContainer keyboardAvoiding decorative contentStyle={styles.content}>
      <Header
        title="Risk Check-in"
        subtitle="Answer a few questions — we'll combine them with live Tuguegarao weather."
      />

      <Card variant="soft" style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={[styles.infoIcon, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.infoTextBlock}>
            <AppText variant="label" style={{ color: colors.text }}>
              Personalized assessment
            </AppText>
            <AppText variant="caption" muted style={styles.infoText}>
              Your result updates instantly using real-time weather and your health profile.
            </AppText>
          </View>
        </View>
      </Card>

      <AssessmentFormContainer onSuccess={handleSuccess} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  infoCard: {
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  infoTextBlock: {
    flex: 1,
    gap: 4,
  },
  infoText: {
    lineHeight: 20,
  },
});
