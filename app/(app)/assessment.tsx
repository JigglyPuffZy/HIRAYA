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
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

export default function AssessmentScreen() {
  const router = useRouter();

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
        subtitle="Answer a few quick questions — we'll use live Tuguegarao weather."
        showBack
      />

      <Card variant="soft" style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons name="pulse-outline" size={20} color={Colors.primary} />
          </View>
          <AppText variant="caption" style={styles.infoText}>
            Your result updates instantly using real-time weather and your health profile.
          </AppText>
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
    gap: Spacing.sm,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoText: {
    flex: 1,
    color: Colors.primaryDark,
    lineHeight: 20,
  },
});
