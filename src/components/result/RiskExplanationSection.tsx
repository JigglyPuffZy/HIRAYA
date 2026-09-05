import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { formatRiskLevelTitle } from '@/constants/riskLevels';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface RiskExplanationSectionProps {
  riskLevel: string;
  explanation?: string;
  primaryRiskFactors?: string[];
}

export function RiskExplanationSection({
  riskLevel,
  explanation,
  primaryRiskFactors = [],
}: RiskExplanationSectionProps) {
  const { colors } = useTheme();

  if (!explanation && primaryRiskFactors.length === 0) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <SectionHeader
        title={`${formatRiskLevelTitle(riskLevel)} risk`}
        subtitle="Why you received this level"
        icon="information-circle-outline"
      />

      {explanation ? (
        <AppText variant="body" muted style={styles.explanation}>
          {explanation}
        </AppText>
      ) : null}

      {primaryRiskFactors.length > 0 ? (
        <View style={styles.factorList}>
          <AppText variant="label" style={{ color: colors.text }}>
            Your risk is elevated because:
          </AppText>
          {primaryRiskFactors.map((factor) => (
            <View key={factor} style={[styles.factorRow, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderLight }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.primary} />
              <AppText variant="body" style={styles.factorText}>
                {factor}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.md,
  },
  explanation: {
    lineHeight: 22,
  },
  factorList: {
    gap: Spacing.sm,
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  factorText: {
    flex: 1,
    lineHeight: 22,
  },
});
